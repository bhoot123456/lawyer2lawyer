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

    // Admin specific
    permissions: {
      manageLawyers: { type: Boolean, default: true },
      manageClients: { type: Boolean, default: true },
      manageCases: { type: Boolean, default: true },
      manageArticles: { type: Boolean, default: true },
      manageBareActs: { type: Boolean, default: true },
      manageTribunals: { type: Boolean, default: true },
      manageRevenue: { type: Boolean, default: true },
      manageTax: { type: Boolean, default: true },
      manageReports: { type: Boolean, default: true },
      manageBareActs: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

// Indexes for admin queries
userSchema.index({ role: 1, verificationStatus: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ role: 1, isSuspended: 1 });
userSchema.index({ name: "text", email: "text", specialization: "text" });

module.exports = mongoose.model("User", userSchema);