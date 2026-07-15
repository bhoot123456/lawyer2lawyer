/**
 * Notification Controller
 *
 * Why this file is needed:
 * - Exposes notification endpoints (briefing + history + read status).
 * - Keeps request/response logic separate from business logic in services.
 *
 * Where it should be placed:
 * - app/backend/controllers/notificationController.js
 *
 * Which existing files need modification:
 * - app/backend/routes/notifications.js (next file) will import this controller.
 * - app/backend/index.js (later) will mount the notifications routes.
 * - app/mobile/src/screens/DashboardScreen.js (later) will consume briefing endpoint.
 *
 * Complete integration steps (what will happen across files):
 * 1) This controller will be wired into routes in app/backend/routes/notifications.js.
 * 2) Routes will be mounted in app/backend/index.js.
 * 3) Mobile will call GET /api/notifications/briefing/today.
 */

const Notification = require("../models/Notification");
const { buildTodayBriefing } = require("../services/notificationBriefingService");

function sendError(res, statusCode, message, details) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}

exports.getTodayBriefing = async (req, res) => {
  try {
    const user = req.user;
    const payload = await buildTodayBriefing({ user });

    return res.json({
      success: true,
      data: payload,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getTodayBriefing error:", err);
    return sendError(res, 500, "Failed to build today briefing");
  }
};

exports.listUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      page = "1",
      limit = "20",
      category,
      status = "unread",
    } = req.query;

    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const filter = {
      user: userId,
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
      archivedAt: null,
    };

    const [items, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page: p,
          limit: l,
          totalPages: Math.ceil(total / l),
        },
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("listUserNotifications error:", err);
    return sendError(res, 500, "Failed to list notifications");
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const updated = await Notification.findOneAndUpdate(
      { _id: id, user: userId, archivedAt: null },
      { status: "read", readAt: new Date() },
      { new: true },
    ).lean();

    if (!updated) {
      return sendError(res, 404, "Notification not found");
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("markNotificationRead error:", err);
    return sendError(res, 500, "Failed to update notification");
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { user: userId, status: "unread", archivedAt: null },
      { $set: { status: "read", readAt: new Date() } },
    );

    return res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("markAllRead error:", err);
    return sendError(res, 500, "Failed to mark all notifications as read");
  }
};


