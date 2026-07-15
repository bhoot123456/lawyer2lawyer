const mongoose = require("mongoose");

const { Schema } = mongoose;

/**
 * DailyCauseListEntry model
 *
 * Represents a single cause-list line/item.
 * This is intentionally flexible for v1 because official cause list structures differ.
 */

const dailyCauseListEntrySchema = new Schema(
  {
    dedupeKey: { type: String, required: true, unique: true, index: true },

    sourceId: { type: String, default: "", index: true },

    // Court identity
    court: { type: String, required: true, index: true, trim: true },
    jurisdiction: { type: String, default: "", index: true, trim: true },
    district: { type: String, default: "", trim: true },

    // Date for which this cause list applies
    causeListDate: { type: Date, required: true, index: true },

    // Basic case identifiers
    caseNumber: { type: String, default: "", index: true, trim: true },
    caseTitle: { type: String, default: "", index: true, trim: true },

    // Bench / section if any
    bench: { type: String, default: "", trim: true },
    causeStage: { type: String, default: "", trim: true },

    // Parties (optional)
    parties: { type: String, default: "", trim: true },

    // Display/citation fields
    displayOrder: { type: Number, default: null, index: true },

    // Optional extracted snippet (for search)
    notes: { type: String, default: "", trim: true },

    // Published / effective metadata
    publishedAt: { type: Date, default: null, index: true },
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

// Search across key text fields
// (Mongo text indexes work best for shorter fields; keep notes concise)
dailyCauseListEntrySchema.index({ caseTitle: "text", caseNumber: "text", notes: "text" });

// Common query indexes
// Date + court are frequent for dashboard
dailyCauseListEntrySchema.index({ causeListDate: 1, court: 1, jurisdiction: 1 });

module.exports = mongoose.model(
  "DailyCauseListEntry",
  dailyCauseListEntrySchema
);

