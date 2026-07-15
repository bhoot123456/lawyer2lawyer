const mongoose = require("mongoose");

const { Schema } = mongoose;

/**
 * SourceItem is a common audit+de-dupe record for any ingested judiciary item.
 *
 * Why it exists:
 * - Central place to track what was seen in which ingestion run.
 * - Enables “update/validate/store/remove duplicates” in a reliable, idempotent way.
 * - Works across multiple concrete content models (Judgments, Holidays, Cause Lists, etc.).
 */

const judicialIngestionSourceItemSchema = new Schema(
  {
    // The concrete content model this record belongs to.
    // Example: "judicial_judgment", "cause_list_entry", "court_holiday", etc.
    kind: {
      type: String,
      required: true,
      index: true,
    },

    // A stable identifier derived from official source metadata when possible.
    // Example: judgment citation+date+court, holiday notification id, etc.
    sourceId: {
      type: String,
      default: null,
      index: true,
    },

    // Canonical dedupe key used for upserts.
    // Must be stable across runs and unique per kind.
    dedupeKey: {
      type: String,
      required: true,
      index: true,
    },

    // Human readable title for debugging/admin.
    title: { type: String, default: "" },

    // Optional direct URL to official page/PDF.
    sourceUrl: { type: String, default: "" },

    // Ingestion run tracking
    ingestionRunId: { type: String, default: null, index: true },
    lastSeenAt: { type: Date, default: null, index: true },

    // If an item is no longer present in the latest ingestion, we mark it removed.
    // Consumers can filter status.
    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
      index: true,
    },

    // Debug metadata about validation/normalization
    validation: {
      isValid: { type: Boolean, default: true },
      errors: { type: [String], default: [] },
      warnings: { type: [String], default: [] },
    },

    // Generic payload (kept minimal; avoid huge HTML blobs)
    normalizedMeta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Ensure per kind uniqueness for dedupeKey.
// Note: if dedupeKey generation changes, you should version it (v1/v2).
judicialIngestionSourceItemSchema.index({ kind: 1, dedupeKey: 1 }, { unique: true });

module.exports = mongoose.model(
  "JudicialIntelligenceSourceItem",
  judicialIngestionSourceItemSchema
);

