const mongoose = require("mongoose");

const { Schema } = mongoose;

const judgeDirectorySchema = new Schema(
  {
    // Court identifier — maps to court ids used in the frontend (e.g., "delhi-high-court", "tis-hazari-courts")
    courtId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Human-readable court name (e.g., "Delhi High Court")
    courtName: {
      type: String,
      required: true,
      trim: true,
    },

    // Court room identifier (e.g., "Court Room 1 (DB-1)")
    courtRoom: {
      type: String,
      required: true,
      trim: true,
    },

    // Bench type (e.g., "Division Bench", "Single Bench")
    bench: {
      type: String,
      trim: true,
      default: "",
    },

    // Full name of the judge
    judgeName: {
      type: String,
      required: true,
      trim: true,
    },

    // Video conferencing link (Webex, Zoom, etc.)
    vcLink: {
      type: String,
      required: true,
      trim: true,
    },

    // Meeting ID for VC
    meetingId: {
      type: String,
      required: true,
      trim: true,
    },

    // Chamber email address
    email: {
      type: String,
      trim: true,
      default: "",
    },

    // Display ordering (lower = appears first)
    displayOrder: {
      type: Number,
      default: 0,
    },

    // Tags for search and categorization
    tags: [{ type: String, trim: true }],

    // Publication status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },

    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Primary lookup: all published judges for a court, sorted by display order
judgeDirectorySchema.index({ courtId: 1, displayOrder: 1 });

// Admin filtering by status
judgeDirectorySchema.index({ status: 1, courtId: 1 });

// Full-text search across judge name, court room, and court name
judgeDirectorySchema.index(
  { judgeName: "text", courtRoom: "text", courtName: "text", email: "text" },
);

module.exports = mongoose.model("JudgeDirectory", judgeDirectorySchema);

