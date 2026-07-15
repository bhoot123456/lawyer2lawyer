const mongoose = require("mongoose");

const { Schema } = mongoose;

const supremeCourtRoomSchema = new Schema(
  {
    courtRoom: { type: String, required: true, trim: true, index: true },
    vcLink: { type: String, trim: true, default: "" },
    meetingId: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Live", "Scheduled", "Offline"],
      default: "Offline",
      index: true,
    },
    isFavourite: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

supremeCourtRoomSchema.index({ courtRoom: "text" });

module.exports = mongoose.model("SupremeCourt", supremeCourtRoomSchema);