const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["client", "lawyer", "admin"],
      required: true,
      default: "client",
    },
    state: { type: String, required: true },
    city: { type: String, required: true },
    specialization: { type: String, default: "General" },
    phone: { type: String },
    about: { type: String },

    // Admin & Lawyer management fields
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    rejectionReason: { type: String, default: "" },

    // Extended lawyer profile fields
    experience: { type: Number, default: 0 }, // years of experience
    barCouncilNumber: { type: String, default: "" },
    courts: [{ type: String }], // courts where lawyer practices
    states: [{ type: String }], // states where lawyer practices
    documents: [
      {
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    availableForConsultation: { type: Boolean, default: false },

    // ── Admin hierarchy ──────────────────────────────────────────────
    // role stays "admin" for backward compatibility with existing JWTs and
    // login flows; adminType defines the administrative hierarchy.
    adminType: {
      type: String,
      enum: [
        "super_admin",
        "content_admin",
        "legal_data_admin",
        "police_admin",
        "court_admin",
        "editor",
        "viewer",
      ],
    },
    lastLoginAt: { type: Date },

    // Admin specific
    // Flat permission map: legacy keys ("manageLawyers") AND granular keys
    // ("tribunals.edit"). Authorization requires an EXPLICIT true value;
    // missing/undefined permissions are always denied (secure by default).
    permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

// Indexes for admin queries
userSchema.index({ role: 1, verificationStatus: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ role: 1, isSuspended: 1 });
userSchema.index({ name: "text", email: "text", specialization: "text" });

module.exports = mongoose.model("User", userSchema);
