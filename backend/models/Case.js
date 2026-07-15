const mongoose = require("mongoose");

const { Schema } = mongoose;

const STATUS = [
  "Pending",
  "Filed",
  "Notice Issued",
  "Reply Filed",
  "Evidence",
  "Arguments",
  "Reserved",
  "Disposed",
  "Closed",
];

const PRIORITY = ["Low", "Medium", "High", "Urgent"];

const CASE_STAGE_DEFAULTS = [
  "Draft",
  "Pending",
  "Filed",
  "Notice Issued",
  "Reply Filed",
  "Evidence",
  "Arguments",
  "Reserved",
  "Disposed",
  "Closed",
];

const documentSchema = new Schema(
  {
    documentName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedAt: { type: Date, default: Date.now },
    category: {
      type: String,
      trim: true,
      enum: [
        "Petition",
        "Reply",
        "Evidence",
        "Order",
        "Judgment",
        "Notice",
        "Affidavit",
        "Agreement",
        "Other",
      ],
      default: "Other",
    },
  },
  { _id: true },
);

const noteSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true },
);

const timelineSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Case Created",
        "Document Uploaded",
        "Next Hearing Changed",
        "Status Updated",
        "Note Added",
        "Expense Updated",
        "Other",
      ],
      default: "Other",
    },
    description: { type: String, default: "" },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const expenseSchema = new Schema(
  {
    courtFee: { type: Number, default: 0, min: 0 },
    stamp: { type: Number, default: 0, min: 0 },
    printing: { type: Number, default: 0, min: 0 },
    travel: { type: Number, default: 0, min: 0 },
    miscellaneous: { type: Number, default: 0, min: 0 },
    totalExpense: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const caseSchema = new Schema(
  {
    caseTitle: { type: String, trim: true },
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // Parties / legal context

    client: { type: String, trim: true },
    advocate: { type: String, trim: true },

    court: { type: String, trim: true },
    judge: { type: String, trim: true },

    oppositeParty: { type: String, trim: true },
    oppositeAdvocate: { type: String, trim: true },

    practiceArea: { type: String, trim: true },
    caseType: { type: String, trim: true },

    // Dates
    filingDate: { type: Date },
    registrationDate: { type: Date },
    nextHearingDate: { type: Date },

    // Stage/status/priority
    currentStage: {
      type: String,
      trim: true,
      enum: CASE_STAGE_DEFAULTS,
      default: "Pending",
      index: true,
    },

    status: {
      type: String,
      trim: true,
      enum: STATUS,
      default: "Pending",
      index: true,
    },

    priority: {
      type: String,
      trim: true,
      enum: PRIORITY,
      default: "Medium",
      index: true,
    },

    description: { type: String, default: "" },
    importantNotes: { type: String, default: "" },

    caseTags: { type: [String], default: [] },

    // Ownership / assignment
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Documents
    documents: { type: [documentSchema], default: [] },

    // Expenses (single rollup object)
    expenses: { type: expenseSchema, default: () => ({}) },

    // Timeline history
    timeline: { type: [timelineSchema], default: [] },

    // Notes (unlimited)
    notes: { type: [noteSchema], default: [] },
  },
  {
    timestamps: true,
  },
);

// Ensure totalExpense stays consistent when expenses are provided.
caseSchema.pre("save", function (next) {
  if (this.expenses) {
    const e = this.expenses;
    e.totalExpense =
      (e.courtFee || 0) +
      (e.stamp || 0) +
      (e.printing || 0) +
      (e.travel || 0) +
      (e.miscellaneous || 0);
  }
  next();
});

// Extra indexes to support search/filter
caseSchema.index({ client: 1 });
caseSchema.index({ court: 1 });
caseSchema.index({ advocate: 1 });
caseSchema.index({ nextHearingDate: 1 });
caseSchema.index({ practiceArea: 1 });
caseSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Case", caseSchema);


