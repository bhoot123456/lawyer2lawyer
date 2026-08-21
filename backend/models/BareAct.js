const mongoose = require("mongoose");

const { Schema } = mongoose;

function toSlug(input) {
  if (input === undefined || input === null) return "";
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-()]/g, "");
}

const bareActSchema = new Schema(
  {
    // Stable identifier for the static dataset (NO: using title as unique key)
    slug: {
      type: String,
      required: true,
      trim: true,
    },


    // Dataset fields
    title: { type: String, required: true, trim: true },
    actName: { type: String, trim: true },
    shortName: { type: String, trim: true },
    year: { type: String, trim: true, index: true },
    category: { type: String, trim: true },

    ministry: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    language: { type: String, trim: true, default: "English" },

    pdfUrl: { type: String, trim: true },

    // --- Curated source / verification metadata (India Code) ---
    // Optional fields populated from the curated Central Bare Acts dataset.
    // Additive only: never break existing records; null/unset means "unresolved/pending".
    sourceName: { type: String, trim: true },
    sourceType: { type: String, trim: true },
    indiaCodeSearchUrl: { type: String, trim: true },
    indiaCodeUrl: { type: String, trim: true },
    // e.g. "pending-india-code-resolution" | "verified-india-code" | "verified-manual"
    pdfVerificationStatus: { type: String, trim: true },
    statusNote: { type: String, trim: true },

    isPopular: { type: Boolean, default: false, index: true },
    isNewLaw: { type: Boolean, default: false, index: true },

    // Existing/custom fields used by admin CRUD
    sectionNumber: { type: String, trim: true },
    content: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    jurisdiction: { type: String, trim: true },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Unique key based on actName + year (stable for dataset). slug is used as unique key.
bareActSchema.index({ slug: 1 }, { unique: true });

// Indexes for required API capabilities
bareActSchema.index({ category: 1 });
bareActSchema.index({ shortName: 1 });

// Text search across user-facing fields
bareActSchema.index({ title: "text", actName: "text", shortName: "text", category: "text", keywords: "text", pdfUrl: "text" });

// Lightweight indexes to support the new source/verification metadata.
bareActSchema.index({ jurisdiction: 1 });
bareActSchema.index({ pdfVerificationStatus: 1 });

bareActSchema.pre("validate", function (next) {
  // Auto-fill slug if missing (keeps admin CRUD safe)
  if (!this.slug) {
    const actName = this.actName || "";
    const year = this.year || "";
    const base = `${actName}::${year}`;
    this.slug = toSlug(base);
  }
  next();
});

module.exports = mongoose.model("BareAct", bareActSchema);
