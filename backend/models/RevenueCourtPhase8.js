const mongoose = require("mongoose");

const { Schema } = mongoose;

const revenueCourtPhase8Schema = new Schema(
  {
    // Use a human title + key for easy lookup
    title: { type: String, required: true, trim: true, index: true },
    key: { type: String, required: true, unique: true, trim: true, index: true },

    topic: { type: String, trim: true },
    content: { type: String, default: "" },

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

revenueCourtPhase8Schema.index({ title: "text", content: "text" });

module.exports = mongoose.model("RevenueCourtPhase8", revenueCourtPhase8Schema);

