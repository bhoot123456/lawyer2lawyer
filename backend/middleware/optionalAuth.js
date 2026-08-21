const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Optional authentication middleware.
 *
 * Unlike the required `auth` middleware, this middleware:
 * - If a valid Bearer token is present: sets req.user with the user document
 * - If no token or invalid/expired token: silently continues WITHOUT returning 401
 *
 * This enables endpoints to support BOTH:
 *   - Authenticated users (req.user is set)
 *   - Anonymous/public users (req.user is undefined)
 *
 * Usage: Mount on public AI chat endpoints, public read-only endpoints, etc.
 */
module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;

  // No auth header — continue as anonymous user
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    if (!process.env.JWT_SECRET) {
      // Server misconfigured — silently continue as anonymous
      return next();
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-password");

    if (user) {
      req.user = user;
    }
    // If user not found (deleted account, etc.), continue as anonymous
  } catch (error) {
    // Token invalid, expired, or malformed — continue as anonymous
    // NEVER return 401 — this is the key difference from the required auth middleware
  }

  next();
};

