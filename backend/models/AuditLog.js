const mongoose = require("mongoose");

/**
 * AuditLog
 * --------
 * Immutable record of every sensitive administrative mutation.
 *
 * SECURITY:
 *  - Never store passwords, tokens or secrets here (enforced by callers via
 *    the sanitize step in the audit service).
 */
const auditLogSchema = new mongoose.Schema(
  {
    // Who
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    adminName: { type: String, default: "" },
    adminEmail: { type: String, default: "" },
    adminType: { type: String, default: "" },

    // What
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "RESTORE",
        "PUBLISH",
        "UNPUBLISH",
        "ARCHIVE",
        "VERIFY",
        "ACTIVATE",
        "DEACTIVATE",
        "PERMISSION_GRANTED",
        "PERMISSION_REVOKED",
        "ADMIN_CREATED",
        "ADMIN_UPDATED",
        "ADMIN_SUSPENDED",
        "ADMIN_ACTIVATED",
        "ADMIN_DEACTIVATED",
      ],
      index: true,
    },

    // Which module / record
    module: { type: String, required: true, index: true },
    recordId: { type: String, default: "", index: true },
    recordLabel: { type: String, default: "" },

    // Change detail
    changedFields: [{ type: String }],
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },

    // Request context
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }, // createdAt = event time
);

auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
