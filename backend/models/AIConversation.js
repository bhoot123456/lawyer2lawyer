const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Not required — public users can use AI without authentication.
      // Authenticated users will have userId set for conversation ownership.
      required: false,
      index: true,
      default: undefined,
    },
    title: { type: String, required: true, trim: true, default: "AI Conversation" },
    pinned: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    messages: { type: [messageSchema], default: [] },
    lastUsedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

aiConversationSchema.index({ userId: 1, pinned: -1, updatedAt: -1 });
aiConversationSchema.index({ title: "text", "messages.content": "text" });

module.exports = mongoose.model("AIConversation", aiConversationSchema);
