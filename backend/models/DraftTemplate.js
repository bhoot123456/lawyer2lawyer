const mongoose = require("mongoose");

const { Schema } = mongoose;

const fieldEntrySchema = new Schema({
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed, default: "" },
}, { _id: false });

const draftTemplateSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    templateId: { type: String, required: true, trim: true },
    sectionKey: { type: String, required: true, trim: true },
    filledFields: [fieldEntrySchema],
    customBody: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isSaved: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DraftTemplate", draftTemplateSchema);