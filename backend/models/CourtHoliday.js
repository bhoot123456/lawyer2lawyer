const mongoose = require("mongoose");

const { Schema } = mongoose;

/**
 * CourtHoliday model
 *
 * Stores court/district/tribunal holidays and closure notifications.
 * Used by:
 * - Dashboard cards (today/next)
 * - Universal search
 * - AI retrieval
 */

const courtHolidaySchema = new Schema(
  {
    dedupeKey: { type: String, required: true, unique: true, index: true },

    sourceId: { type: String, default: "", index: true },

    title: { type: String, required: true, index: true, trim: true },

    jurisdiction: { type: String, default: "", index: true, trim: true },
    court: { type: String, required: true, index: true, trim: true },

    // Date of holiday/closure
    holidayDate: { type: Date, required: true, index: true },

    // Optional additional metadata
    holidayType: {
      type: String,
      enum: ["holiday", "closure", "restricted_work"],
      default: "holiday",
      index: true,
    },

    // When the notification was published
    publishedAt: { type: Date, default: null, index: true },
    effectiveFrom: { type: Date, default: null },
    effectiveTo: { type: Date, default: null },

    reason: { type: String, default: "" },

    sourceUrl: { type: String, default: "", trim: true },

    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
      index: true,
    },

    lastSeenAt: { type: Date, default: null, index: true },

    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Text search: title + reason
courtHolidaySchema.index({ title: "text", reason: "text" });

// Query by date range
courtHolidaySchema.index({ holidayDate: 1, court: 1 });

module.exports = mongoose.model("CourtHoliday", courtHolidaySchema);

