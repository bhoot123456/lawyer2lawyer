const router = require("express").Router();

const auth = require("../middleware/auth");
const authService = require("../services/authService");

router.post("/register", async (req, res) => {
  try {
    const payload = req.body || {};

    const {
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
    } = payload;

    // SECURITY: Public registration must never mint a privileged account.
    // Only self-service roles may be self-assigned; anything else (including
    // "admin") is forcibly downgraded to the default "client" role.
    const ALLOWED_SELF_SERVICE_ROLES = ["client", "lawyer"];
    let safeRole = (role || "client").toLowerCase().trim();
    if (!ALLOWED_SELF_SERVICE_ROLES.includes(safeRole)) {
      safeRole = "client";
    }

    // Preserve existing required fields contract.
    if (!name && !fullName) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email || !password || !role || !state || !city) {
      return res.status(400).json({
        message: "Name, email, password, role, state, and city are required",
      });
    }

    const { user, accessToken, refreshToken } = await authService.register({
      req,
      name,
      fullName,
      email,
      password,
      role: safeRole,
      state,
      city,
      specialization,
      phone,
      mobileNumber,
      about,
    });

    // Phase 1 integration: register currently returns token used by the existing app.
    // We return accessToken as `token` for backward compatibility, and also return refreshToken.
    res.json({
      user,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    const status = error?.statusCode || 500;
    res.status(status).json({ message: error?.message || "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const tokens = await authService.login({ email, password, req });

    // Keep old response key `token` so mobile doesn't break.
    res.json({
      user: tokens.user,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: tokens.sessionId,
    });
  } catch (error) {
    console.error(error);
    const status = error?.statusCode || 500;
    res.status(status).json({ message: error?.message || "Something went wrong" });
  }
});

// Refresh token rotation
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    const tokens = await authService.refresh({ refreshToken, req });

    res.json({
      user: tokens.user,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: tokens.sessionId,
    });
  } catch (error) {
    console.error(error);
    const status = error?.statusCode || 500;
    res.status(status).json({ message: error?.message || "Unable to refresh" });
  }
});

// Logout current device (revoke current refresh session)
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    await authService.logoutCurrent({ refreshToken, req });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    const status = error?.statusCode || 500;
    res.status(status).json({ message: error?.message || "Logout failed" });
  }
});

// Logout from all devices (revoke all sessions)
router.post("/logout-all", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    // Decode userId from refresh token for revocation.
    // authService.logoutAll expects userId.
    const jwtLib = require("jsonwebtoken");
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

    let payload;
    try {
      if (!refreshToken) {
        return res.json({ success: true });
      }
      payload = jwtLib.verify(refreshToken, refreshSecret);
    } catch {
      // If token invalid, still respond success for idempotency.
      return res.json({ success: true });
    }

    await authService.logoutAll({ userId: payload?.userId });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    const status = error?.statusCode || 500;
    res
      .status(status)
      .json({ message: error?.message || "Logout-all failed" });
  }
});

// Get authenticated user profile
router.get("/me", auth, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;

