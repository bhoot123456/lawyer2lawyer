const mongoose = require("mongoose");

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    key: { type: String, required: true, unique: true, trim: true, index: true },

    description: { type: String, default: "" },

    // Report can be stored as text/HTML. If you store PDFs, use a URL field.
    content: { type: String, default: "" },

    coverImage: { type: String, default: "" },
    tags: [{ type: String, trim: true }],

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

reportSchema.index({ title: "text", description: "text", content: "text" });

module.exports = mongoose.model("Report", reportSchema);

