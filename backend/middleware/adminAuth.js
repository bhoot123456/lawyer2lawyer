const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { hasExplicitPermission } = require("../admin/permissions/registry");

/** True when the (already authenticated) user is the highest-level admin. */
function isSuperAdmin(user) {
  return !!user && user.role === "admin" && user.adminType === "super_admin";
}

/**
 * Middleware to verify that the request comes from an authenticated admin user.
 * Must be used after the standard auth middleware.
 */
module.exports = async function (req, res, next) {
  try {
    // req.user should already be set by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    if (!req.user.isActive || req.user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Account is suspended or inactive. Contact super admin.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(500).json({ message: "Server error during authorization" });
  }
};

/**
 * Check admin permission for a specific action.
 *
 * SECURITY MODEL (explicit grants only):
 *   - authorization is evaluated from the SERVER-SIDE authenticated user;
 *     client-supplied role/permission fields are never trusted.
 *   - super_admin bypasses all checks.
 *   - a permission is granted ONLY when it is explicitly `true` on the user
 *     document (granular grant, or an explicit legacy `manage*` grant mapped
 *     through the central registry).
 *   - undefined / missing permissions are ALWAYS denied.
 */
module.exports.checkPermission = function (permission) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    if (isSuperAdmin(req.user)) return next();

    if (!hasExplicitPermission(req.user.permissions, permission)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't have permission to perform this action.",
        code: "PERMISSION_DENIED",
        requiredPermission: permission,
      });
    }

    next();
  };
};

module.exports.isSuperAdmin = isSuperAdmin;
