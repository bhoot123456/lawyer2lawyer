const mongoose = require("mongoose");

const { Schema } = mongoose;

const districtCourtJudgeSchema = new Schema(
  {
    // Court complex identifier (e.g., "rohini", "tis-hazari", "saket")
    complexId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // District identifier (e.g., "north", "north-west", "central")
    districtId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Full name of the judge
    judgeName: {
      type: String,
      required: true,
      trim: true,
    },

    // Designation (e.g., "Additional District & Sessions Judge", "Civil Judge")
    designation: {
      type: String,
      trim: true,
      default: "",
    },

    // Jurisdiction (e.g., "North District", "Central District")
    jurisdiction: {
      type: String,
      trim: true,
      default: "",
    },

    // Court room identifier (e.g., "Court Room 101", "Court Room 204")
    courtRoom: {
      type: String,
      required: true,
      trim: true,
    },

    // Video conferencing link
    vcLink: {
      type: String,
      trim: true,
      default: "",
    },

    // Meeting ID for VC
    meetingId: {
      type: String,
      trim: true,
      default: "",
    },

    // Official email
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

    // Whether this judge record is currently active
    isActive: {
      type: Boolean,
      default: true,
    },

    // Publication status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },

    publishedAt: { type: Date },

    // ── Leave-related fields ───────────────────────────
    // Whether this judge is currently on leave
    isOnLeave: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Leave period start date
    leaveFrom: {
      type: Date,
      default: null,
    },

    // Leave period end date
    leaveTo: {
      type: Date,
      default: null,
    },

    // Optional reason for leave (e.g., "Medical Leave", "Personal Leave")
    leaveReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

// Primary lookup: published judges for a district, sorted by displayOrder
districtCourtJudgeSchema.index({ complexId: 1, districtId: 1, displayOrder: 1 });

// Admin filtering by status
districtCourtJudgeSchema.index({ status: 1, complexId: 1, districtId: 1 });

// Full-text search across judge name, designation, and court room
districtCourtJudgeSchema.index(
  { judgeName: "text", designation: "text", courtRoom: "text" },
);

module.exports = mongoose.model("DistrictCourtJudge", districtCourtJudgeSchema);

