const mongoose = require("mongoose");

const { Schema } = mongoose;

const bareActSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    actName: { type: String, trim: true },
    sectionNumber: { type: String, trim: true },

    // Content can be stored as HTML/text or extracted text
    content: { type: String, default: "" },

    // Optional metadata
    tags: [{ type: String, trim: true }],
    jurisdiction: { type: String, trim: true },
    language: { type: String, trim: true, default: "English" },

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

bareActSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("BareAct", bareActSchema);

