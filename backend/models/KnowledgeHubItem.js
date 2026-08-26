const mongoose = require("mongoose");

/**
 * KnowledgeHubItem
 * ----------------
 * One row per resource link in the Knowledge Hub. Previously the whole hub was
 * a static object (data/knowledgeHub.js) with sections -> resources. This model
 * flattens it so each resource is individually admin-manageable while keeping
 * section grouping fields to reproduce the original response shape.
 */
const knowledgeHubItemSchema = new mongoose.Schema(
  {
    sourceId: { type: String, required: true, unique: true, index: true },

    // Section grouping (mirrors static sections: bare-acts, judgments, ...)
    sectionKey: { type: String, required: true, trim: true, index: true },
    sectionTitle: { type: String, trim: true, default: "" },
    sectionIcon: { type: String, trim: true, default: "" },
    sectionDescription: { type: String, default: "" },

    label: { type: String, required: true, trim: true, index: true },
    url: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

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

knowledgeHubItemSchema.index({ status: 1, sectionKey: 1 });

module.exports = mongoose.model("KnowledgeHubItem", knowledgeHubItemSchema);
