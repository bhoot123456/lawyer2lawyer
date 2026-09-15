const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * PURE role gate — single source of truth for "is this authenticated
 * user a lawyer?". Exported so the security rule can be unit-tested
 * without a database or a running server.
 *
 * A user is considered a lawyer for authorization purposes only when:
 *   - they have a loaded user document, AND
 *   - role === "lawyer", AND
 *   - the account is not explicitly deactivated or suspended
 *
 * (Mongoose coerces `role` through the schema enum, but we guard the
 * string comparison defensively so a malformed document can never
 * satisfy the gate.)
 */
function isLawyer(user) {
  if (!user) return false;
  if (String(user.role).toLowerCase() !== "lawyer") return false;
  if (user.isActive === false) return false;
  if (user.isSuspended === true) return false;
  return true;
}

/**
 * Lawyer route protection for the CourtDesk surface.
 *
 * This is NOT a second authentication system: it reuses the EXACT SAME
 * JWT infrastructure as middleware/auth.js and middleware/adminAuth.js
 * (same JWT_SECRET, same payload shape { userId }, same User lookup).
 * It is a thin RBAC layer that additionally requires role === "lawyer"
 * after the token is verified.
 *
 *  - Missing/invalid/expired token  -> 401
 *  - Valid token but role is not lawyer (admin, client, ...) -> 403
 *  - Valid lawyer token            -> req.user set, next()
 *
 * NOTE on identity precedence (Phase 1 rule #9): this middleware does
 * NOT consume X-Device-Id. It is intentionally mounted on /api/courtdesk
 * WITHOUT deviceAuth so the JWT is the canonical, sole identity for a
 * lawyer's private data — a device header can never scope a lawyer's
 * case list to someone else's device.
 */
module.exports = async function lawyerAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "Server misconfigured (JWT_SECRET missing)" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-password -refreshTokenHash");

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!isLawyer(user)) {
      return res.status(403).json({
        success: false,
        message: "Lawyer privileges required",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports.isLawyer = isLawyer;
