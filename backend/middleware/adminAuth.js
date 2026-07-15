const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
 * Check admin permission for specific module
 */
module.exports.checkPermission = function (permission) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const permissions = req.user.permissions || {};
    if (permissions[permission] === false) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You don't have permission to manage this module.`,
      });
    }

    next();
  };
};