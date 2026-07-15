const mongoose = require("mongoose");

const tribunalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    abbreviation: { type: String, trim: true },
    category: { type: String, trim: true },
    jurisdiction: { type: String, trim: true },
    description: { type: String },
    location: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Tribunal", tribunalSchema);
