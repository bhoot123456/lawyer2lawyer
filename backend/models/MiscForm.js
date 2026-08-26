const mongoose = require("mongoose");

/**
 * MiscForm
 * --------
 * One row per downloadable form/template in the Miscellaneous Forms module.
 * Previously served from the static data/miscForms.js grouped array
 * (categories -> items). Flattened with category fields preserved so the
 * public API can rebuild the exact grouped response shape.
 */
const miscFormSchema = new mongoose.Schema(
  {
    sourceId: { type: String, required: true, unique: true, index: true },

    category: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    url: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    language: { type: String, trim: true, default: "" },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },

    sourceName: { type: String, trim: true, default: "" },
    verificationStatus: {
      type: String,
      enum: ["verified", "unverified"],
      default: "unverified",
    },
    lastVerifiedAt: { type: Date },
    verifiedBy: { type: String, trim: true, default: "" },

    versionNumber: { type: Number, default: 1 },
    changeSummary: { type: String, default: "" },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

miscFormSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model("MiscForm", miscFormSchema);
