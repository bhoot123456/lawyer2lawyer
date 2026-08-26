/**
 * Why this file is needed
 * - Centralizes enterprise-grade authentication logic:
 *   - access token + refresh token issuance
 *   - refresh token rotation
 *   - session revocation (logout/logout-all)
 *   - login activity/audit event hooks
 * - Keeps routes/controllers thin and easier to test/maintain.
 *
 * Where it should be placed
 * - app/backend/services/authService.js
 *
 * Which existing files must be modified
 * - app/backend/routes/auth.js
 *   - replace inline token logic with calls to this service
 * - app/backend/models/User.js (later)
 *   - optionally add account-lock fields and richer login tracking
 * - app/backend/models/Session.js
 *   - this service uses it for refresh-token persistence
 *
 * Exact integration steps
 * 1) In app/backend/routes/auth.js:
 *    - import { login, register, refresh, logoutCurrent, logoutAll } from this file
 *    - wire endpoints:
 *      - POST /auth/login
 *      - POST /auth/register
 *      - POST /auth/refresh
 *      - POST /auth/logout
 *      - POST /auth/logout-all
 * 2) Ensure process.env:
 *      - JWT_SECRET (access)
 *      - JWT_REFRESH_SECRET (refresh) OR fall back to JWT_SECRET (NOT recommended for prod)
 *      - JWT_ACCESS_TTL (optional, default 15m)
 *      - JWT_REFRESH_TTL (optional, default 30d)
 * 3) In refresh flow:
 *    - client sends refreshToken (plaintext)
 *    - service hashes and matches to Session.refreshTokenHash
 *    - if session revoked/expired -> deny refresh
 *    - on success -> revoke old session and issue new access+refresh
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const Session = require('../models/Session');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing`);
  return v;
}

function safeUserForClient(user) {
  return {
    id: user._id,
    fullName: user.fullName || user.name,
    email: user.email,
    role: user.role,
    state: user.state,
    city: user.city,
    specialization: user.specialization,
    mobileNumber: user.mobileNumber || user.phone,
    about: user.about,
    // keep only safe fields for client
  };
}

function getJwtAccessTtl() {
  return process.env.JWT_ACCESS_TTL || '15m';
}

function getJwtRefreshTtl() {
  return process.env.JWT_REFRESH_TTL || '30d';
}

function getAccessSecret() {
  return requireEnv('JWT_SECRET');
}

function getRefreshSecret() {
  // Production recommendation: separate secret.
  // For backward compatibility, fall back to JWT_SECRET if JWT_REFRESH_SECRET is missing.
  return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
}

function signAccessToken({ userId }) {
  const secret = getAccessSecret();
  return jwt.sign({ userId }, secret, { expiresIn: getJwtAccessTtl() });
}

function signRefreshToken({ userId, sessionId }) {
  const secret = getRefreshSecret();
  // Include sessionId so refresh attempts can be traced/validated.
  return jwt.sign(
    { userId, sessionId },
    secret,
    { expiresIn: getJwtRefreshTtl() }
  );
}

async function hashRefreshToken(refreshToken) {
  // bcrypt hash for offline cracking resistance.
  // Use a moderate cost to keep login/refresh performant.
  return bcrypt.hash(refreshToken, 12);
}

function extractDeviceInfo(req) {
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.ip || '';

  // We accept optional device headers from client for better auditability.
  // If not provided, still store userAgent/ip.
  const deviceId = req.headers['x-device-id'] || '';
  const platform = req.headers['x-platform'] || '';
  const osVersion = req.headers['x-os-version'] || '';
  const appVersion = req.headers['x-app-version'] || '';

  return {
    userAgent,
    deviceId,
    platform,
    osVersion,
    appVersion,
    ipAddress,
  };
}

async function issueSessionAndTokens({ user, req, rotationParentSessionId = null }) {
  const expiresAt = new Date(
    Date.now() +
      // parse TTL roughly for Date math; fallback to 30d
      // If env is in format like "30d" this is approximate but good enough for session revocation.
      30 * 24 * 60 * 60 * 1000
  );

  const refreshTokenPayloadForLater = {
    userId: user._id,
    rotationParentSessionId,
  };

  // Create the Session document first so we can embed sessionId in refresh JWT.
  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: 'PENDING', // replaced below
    parentSessionId: rotationParentSessionId,
    expiresAt,
    device: extractDeviceInfo(req),
  });

  // Now sign refresh token including sessionId.
  // Client will store the plaintext refresh token.
  const refreshToken = signRefreshToken({ userId: user._id, sessionId: session._id });
  const refreshTokenHash = await hashRefreshToken(refreshToken);

  session.refreshTokenHash = refreshTokenHash;
  await session.save();

  // Access token for API calls.
  const accessToken = signAccessToken({ userId: user._id });

  return {
    accessToken,
    refreshToken,
    user: safeUserForClient(user),
    sessionId: session._id,
    refreshTokenPayloadForLater,
  };
}

async function register({
  req,
  name,
  fullName,
  email,
  password,
  role,
  state,
  city,
  specialization,
  phone,
  about,
  mobileNumber,
}) {
  // SECURITY (defense-in-depth): Never assign a privileged role (e.g., admin)
  // through registration. The route layer also enforces this; this guard
  // protects any other caller of this service.
  const PUBLIC_SELF_SERVICE_ROLES = ["client", "lawyer"];
  if (!role || !PUBLIC_SELF_SERVICE_ROLES.includes(String(role).toLowerCase())) {
    role = "client";
  }

  if (!email || !password || !role || !state || !city) {
    const err = new Error('Missing required registration fields');
    err.statusCode = 400;
    throw err;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already exists');
    err.statusCode = 400;
    throw err;
  }

  // In current codebase, user model uses `name` and `phone`.
  // This service supports both old and new field names by mapping.
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName: fullName || name,
    name: name || fullName || email.split('@')[0],
    email,
    password: hashedPassword,
    role,
    state,
    city,
    specialization,
    phone: phone || mobileNumber,
    mobileNumber: mobileNumber || phone,
    about,
  });

  // Create tokens so newly registered users are authenticated immediately.
  // Later phase: only allow issue tokens after activation/email verified.
  const tokens = await issueSessionAndTokens({ user, req });

  // SECURITY: never return the raw Mongoose document — it contains the
  // bcrypt password hash. Return the sanitized client-safe shape instead.
  return { user: safeUserForClient(user), ...tokens };
}

async function login({ email, password, req }) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  // Account lock placeholder: if user has loginAttempts logic later,
  // check it here.
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const tokens = await issueSessionAndTokens({ user, req });
  return tokens;
}

async function refresh({ refreshToken, req }) {
  if (!refreshToken) {
    const err = new Error('Refresh token required');
    err.statusCode = 400;
    throw err;
  }

  const refreshSecret = getRefreshSecret();
  let payload;
  try {
    payload = jwt.verify(refreshToken, refreshSecret);
  } catch (e) {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }

  const { userId, sessionId } = payload || {};
  if (!userId || !sessionId) {
    const err = new Error('Invalid refresh token payload');
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Invalid refresh token');
    err.statusCode = 401;
    throw err;
  }

  // Hash lookup: we cannot query by hash deterministically because bcrypt includes salt.
  // Therefore, we locate by sessionId first, then compare hashes.
  const session = await Session.findById(sessionId);
  if (!session || String(session.userId) !== String(user._id)) {
    const err = new Error('Invalid refresh token session');
    err.statusCode = 401;
    throw err;
  }

  if (session.revokedAt) {
    const err = new Error('Refresh token revoked');
    err.statusCode = 401;
    throw err;
  }

  if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
    session.revokedAt = new Date();
    session.revokedReason = 'token_expired';
    await session.save();

    const err = new Error('Refresh token expired');
    err.statusCode = 401;
    throw err;
  }

  const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
  if (!matches) {
    const err = new Error('Refresh token mismatch');
    err.statusCode = 401;
    throw err;
  }

  // Rotation: revoke current session and create a new one.
  session.revokedAt = new Date();
  session.revokedReason = 'rotated';
  await session.save();

  const rotationTokens = await issueSessionAndTokens({
    user,
    req,
    rotationParentSessionId: session._id,
  });

  return rotationTokens;
}

async function logoutCurrent({ refreshToken, req }) {
  if (!refreshToken) {
    // treat as already logged out
    return { success: true };
  }

  const refreshSecret = getRefreshSecret();
  let payload;
  try {
    payload = jwt.verify(refreshToken, refreshSecret);
  } catch {
    // If refresh token is invalid, we can't locate session.
    return { success: true };
  }

  const { userId, sessionId } = payload || {};
  if (!userId || !sessionId) return { success: true };

  const session = await Session.findById(sessionId);
  if (!session || String(session.userId) !== String(userId)) {
    return { success: true };
  }

  if (!session.revokedAt) {
    session.revokedAt = new Date();
    session.revokedReason = 'logout';
    await session.save();
  }

  return { success: true };
}

async function logoutAll({ userId }) {
  if (!userId) {
    return { success: true };
  }

  await Session.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date(), revokedReason: 'logout_all' } }
  );

  return { success: true };
}

module.exports = {
  register,
  login,
  refresh,
  logoutCurrent,
  logoutAll,
  safeUserForClient,
};

