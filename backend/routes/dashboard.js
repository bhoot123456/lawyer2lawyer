const router = require("express").Router();
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const dashboardController = require("../controllers/dashboardController");

// Public/global data endpoints — accessible without login (optionalAuth).
// If an admin token is present, req.user is populated; otherwise the
// endpoint falls back to anonymous/global data.
// NOTE: /client-calls, /activity/recent, and /dashboard/stats remain
// behind `auth` because they are personal/user-specific data.

// Court holidays (public/global)
router.get("/court-holidays", optionalAuth, dashboardController.getCourtHolidays);

// Daily cause list (public/global)
router.get("/daily-cause-list", optionalAuth, dashboardController.getDailyCauseList);

// Legal news (public/global)
router.get("/legal-news", optionalAuth, dashboardController.getLegalNews);

// Client calls (personal — requires auth)
router.get("/client-calls", auth, dashboardController.getClientCalls);

// Recent activity (personal — requires auth)
router.get("/activity/recent", auth, dashboardController.getRecentActivity);

// Dashboard stats (personal — requires auth)
router.get("/dashboard/stats", auth, dashboardController.getDashboardStats);

module.exports = router;

