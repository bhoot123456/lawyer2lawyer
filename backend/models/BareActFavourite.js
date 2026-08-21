const mongoose = require("mongoose");

const BareActFavouriteSchema = new mongoose.Schema(
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
  },
  { timestamps: true },
);

// Prevent duplicate favourites for same user+bareAct.
BareActFavouriteSchema.index({ user: 1, bareAct: 1 }, { unique: true });

module.exports = mongoose.model(
  "BareActFavourite",
  BareActFavouriteSchema,
);

