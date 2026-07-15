const mongoose = require("mongoose");

const { Schema } = mongoose;

const articleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: "" },
    category: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    tags: [{ type: String, trim: true }],
    coverImage: { type: String, default: "" },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },
    readTime: { type: Number, default: 0 }, // minutes
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

articleSchema.index({ title: "text", content: "text", excerpt: "text" });
articleSchema.index({ status: 1, isFeatured: 1 });
articleSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Article", articleSchema);