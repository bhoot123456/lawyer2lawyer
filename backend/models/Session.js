/**
 * Why this file is needed
 * - Refresh token rotation and session revocation require server-side persistence.
 * - Storing refresh tokens in the User document is risky and makes rotation/revocation harder.
 * - This Session model enables:
 *   - refresh token lookup + rotation state
 *   - logout from current/all devices
 *   - device tracking (last active, device info)
 *   - session timeout enforcement
 *   - audit logging hooks
 *
 * Where it should be placed
 * - app/backend/models/Session.js
 *
 * Which existing files must be modified
 * - app/backend/routes/auth.js (to create sessions + issue/rotate refresh tokens)
 * - app/backend/middleware/auth.js (to validate access token, and optionally attach session context)
 * - app/backend/index.js (only if you later mount additional auth routes; model import works without changes)
 * - app/backend/models/User.js (optional later: you may remove refresh token fields after integrating Session)
 *
 * Exact integration steps
 * 1) Import this model in auth/session services.
 * 2) On login, create a Session document with:
 *    - userId
 *    - refreshTokenHash (hash of refresh token)
 *    - device information
 *    - expiresAt
 *    - revokedAt / revokedReason (when invalidated)
 *    - rotation fields (e.g., rotationVersion / parentId)
 * 3) On refresh, find the session by userId + refreshTokenHash and verify not revoked and not expired.
 * 4) On rotation, revoke old session (set revokedAt) and issue a new refresh token + new session.
 * 5) On logout(current device), revoke the current session.
 * 6) On logout-all, revoke all sessions for the user.
 */

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Store only a hash of the refresh token (never plaintext).
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },

    // Rotation / traceability
    parentSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
    },

    device: {
      userAgent: { type: String, default: '' },
      deviceId: { type: String, default: '' },
      platform: { type: String, default: '' },
      osVersion: { type: String, default: '' },
      appVersion: { type: String, default: '' },
      ipAddress: { type: String, default: '' },
    },

    // Session lifetime
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },

    revokedAt: { type: Date, default: null },
    revokedReason: {
      type: String,
      enum: [
        'logout',
        'logout_all',
        'rotated',
        'password_changed',
        'account_deactivated',
        'account_locked',
        'token_expired',
      ],
      default: null,
    },
  },
  { timestamps: false }
);

// Helpful compound indexes
sessionSchema.index({ userId: 1, revokedAt: 1 });

module.exports = mongoose.model('Session', sessionSchema);

