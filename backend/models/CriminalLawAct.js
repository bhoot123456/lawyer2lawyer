const mongoose = require("mongoose");

/**
 * CriminalLawAct
 * --------------
 * MongoDB source of truth for the Criminal Laws module (previously served from
 * data/criminalLawActs.js). The static file remains only as a migration/seed
 * source; the public API reads this collection.
 *
 * Response compatibility: public API keeps returning { title, actName,
 * category, description, pdfUrl } per record.
 */
const criminalLawActSchema = new mongoose.Schema(
  {
    // Idempotency / migration identity
    sourceId: { type: String, required: true, unique: true, index: true },

    title: { type: String, required: true, trim: true, index: true },
    actName: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "", index: true },
    description: { type: String, default: "" },
    pdfUrl: { type: String, trim: true, default: "" },
    language: { type: String, trim: true, default: "English" },

    // Publication workflow
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },
    publishedAt: { type: Date },
    displayOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },

    // Source / verification metadata
    sourceName: { type: String, trim: true, default: "" },
    sourceUrl: { type: String, trim: true, default: "" },
    verificationStatus: {
      type: String,
      enum: ["verified", "unverified"],
      default: "unverified",
    },
    lastVerifiedAt: { type: Date },
    verifiedBy: { type: String, trim: true, default: "" },

    // Versioning
    versionNumber: { type: Number, default: 1 },
    changeSummary: { type: String, default: "" },

    // Soft delete (legal data is never hard-deleted by admins)
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

criminalLawActSchema.index({ status: 1, category: 1 });
criminalLawActSchema.index({ title: "text", actName: "text" });

module.exports = mongoose.model("CriminalLawAct", criminalLawActSchema);
