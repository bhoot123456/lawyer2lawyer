/**
 * Notification Routes
 *
 * Why this file is needed:
 * - Exposes authenticated endpoints for notification history and the daily briefing dashboard.
 * - Keeps routing concerns separate from controller logic.
 *
 * Where it should be placed:
 * - app/backend/routes/notifications.js
 *
 * Which existing files need modification:
 * - app/backend/index.js (to mount /api/notifications)
 * - app/mobile/src/screens/DashboardScreen.js (to consume /api/notifications/briefing/today)
 *
 * Complete integration steps:
 * 1) Mount this router in app/backend/index.js under /api/notifications.
 * 2) Verify protected endpoints work with JWT (uses existing auth middleware).
 * 3) Update mobile to call GET /api/notifications/briefing/today.
 */

const router = require("express").Router();

const auth = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

// All notification endpoints require authentication
router.use(auth);

// Daily briefing for morning dashboard
router.get("/briefing/today", notificationController.getTodayBriefing);

// In-app notification history
router.get("/", notificationController.listUserNotifications);

// Read/unread operations
router.post("/:id/read", notificationController.markNotificationRead);
router.post("/read-all", notificationController.markAllRead);

module.exports = router;

