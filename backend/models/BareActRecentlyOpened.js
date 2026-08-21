const mongoose = require("mongoose");

const { Schema } = mongoose;

const BareActRecentlyOpenedSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bareAct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BareAct",
      required: true,
      index: true,
    },

    lastOpenedAt: { type: Date, required: true, default: Date.now },
    openCount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

// Upsert key: one row per user+bareAct.
BareActRecentlyOpenedSchema.index({ user: 1, bareAct: 1 }, { unique: true });

// For sorting recently opened
BareActRecentlyOpenedSchema.index({ user: 1, lastOpenedAt: -1 });

module.exports = mongoose.model(
  "BareActRecentlyOpened",
  BareActRecentlyOpenedSchema,
);

