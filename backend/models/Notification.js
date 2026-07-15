/**
 * Notification model
 * 
 * Why this file is needed:
 * - Provides persistent in-app notification history with read/unread state.
 * - Enables enterprise-grade features like badge counts, notification history, and future scheduled/push delivery.
 * 
 * Where it should be placed:
 * - app/backend/models/Notification.js
 * 
 * Which existing files need modification (later, not in this file):
 * - app/backend/index.js (to mount /api/notifications routes)
 * - app/backend/routes/* (new notifications routes/controllers to be added)
 * - app/mobile/src/screens/DashboardScreen.js (to fetch daily briefing)
 * 
 * Complete integration steps (in this iteration):
 * 1) This file can be imported by the new notification service/controller/routes that we add next.
 * 2) After the service/routes are implemented, wire them in app/backend/index.js.
 * 3) Mobile will call GET /api/notifications/briefing/today and GET /api/notifications (history).
 */

const mongoose = require("mongoose");

const { Schema } = mongoose;

const NOTIFICATION_CATEGORIES = [
  // Court holidays
  "court_holiday",
  "supreme_court_holiday",
  "delhi_high_court_holiday",
  "district_court_holiday",
  "national_holiday",
  "state_holiday",
  "emergency_court_closure",

  // Legal updates
  "judgment_supreme_court",
  "judgment_delhi_high_court",
  "judgment_high_court",
  "tribunal_order",
  "important_case_law",
  "landmark_judgment",
  "circular",
  "government_notification",
  "gazette_notification",
  "bare_act_update",
  "act_amendment",
  "rules",
  "regulations",
  "legal_news",

  // Case notifications
  "todays_hearings",
  "tomorrows_hearings",
  "rescheduled_hearings",
  "cancelled_hearings",
  "upcoming_deadlines",
  "client_meetings",
  "court_timings",
  "document_due_dates",
  "task_reminders",
  "payment_reminders",

  // Other
  "system",
];

const readStatusEnum = ["unread", "read"];

const notificationSchema = new Schema(
  {
    // Who should receive this notification
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Classification (used for filtering + preferences)
    category: { type: String, required: true, enum: NOTIFICATION_CATEGORIES, index: true },

    // Title/body for in-app + push payload
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },

    // Optional navigation / context
    // e.g. { route: "/cases/123", caseId: ... }
    meta: { type: Schema.Types.Mixed, default: {} },

    // Read/unread
    status: { type: String, enum: readStatusEnum, default: "unread", index: true },
    readAt: { type: Date, default: null },

    // Delivery channels (future-proof)
    channels: {
      push: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },

    // Scheduling info (for future scheduled notifications)
    // If created by scheduler, scheduledFor is the target trigger time.
    scheduledFor: { type: Date, default: null, index: true },
    deliveredAt: { type: Date, default: null },

    // De-dupe / idempotency (useful for daily briefing generation)
    // e.g. "daily-briefing-2026-07-13" + category
    dedupeKey: { type: String, default: null, index: true },

    // Soft archive for data retention
    archivedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
  }
);

// Common query indexes
notificationSchema.index({ user: 1, status: 1, createdAt: -1 });
notificationSchema.index({ user: 1, archivedAt: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

