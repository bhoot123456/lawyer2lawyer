/**
 * Admin system routes — /api/admin/system/*
 *   GET  /me            current admin's own role/permissions (for permission-aware UI)
 *   GET  /audit-logs    audit trail (audit_logs.view or super admin)
 *   GET  /data-health   per-module record health statistics
 */
const router = require("express").Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { checkPermission, isSuperAdmin } = require("../middleware/adminAuth");

router.use(auth, adminAuth);

// ── Current admin context (permission-aware frontend) ──────────────────────
router.get("/me", (req, res) => {
  const { resolveEffectivePermissions } = require("../admin/permissions/registry");
  const u = req.user;
  res.json({
    success: true,
    data: {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      adminType: u.adminType || null,
      isSuperAdmin: isSuperAdmin(u),
      permissions: resolveEffectivePermissions(u.permissions),
    },
  });
});

// ── Audit logs (Part 37) ────────────────────────────────────────────────────
router.get(
  "/audit-logs",
  (req, res, next) => {
    if (isSuperAdmin(req.user)) return next();
    return checkPermission("audit_logs.view")(req, res, next);
  },
  async (req, res, next) => {
    try {
      const AuditLog = require("../models/AuditLog");
      const { adminId, module, action, recordId, from, to } = req.query;
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));

      const filter = {};
      if (adminId && /^[a-f\d]{24}$/i.test(adminId)) filter.adminId = adminId;
      if (module) filter.module = String(module);
      if (action) filter.action = String(action).toUpperCase();
      if (recordId) filter.recordId = String(recordId);
      if (from || to) {
        filter.createdAt = {};
        if (from && !isNaN(Date.parse(from))) filter.createdAt.$gte = new Date(from);
        if (to && !isNaN(Date.parse(to))) filter.createdAt.$lte = new Date(to);
      }

      const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        AuditLog.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: {
          logs,
          pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// ── Data Health dashboard (Part 38) ─────────────────────────────────────────
router.get(
  "/data-health",
  checkPermission("system.view"),
  async (req, res) => {
    const { CONTENT_REGISTRY } = require("../admin/registry/contentRegistry");
    const results = [];
    for (const mod of Object.values(CONTENT_REGISTRY)) {
      try {
        const baseFilter = mod.deletePolicy === "soft" ? { isDeleted: { $ne: true } } : {};
        const [total, published, draft, archived, unverified, missingSource, recentlyModified] =
          await Promise.all([
            mod.model.countDocuments(baseFilter),
            mod.statusField
              ? mod.model.countDocuments({ ...baseFilter, [mod.statusField]: "published" })
              : mod.model.countDocuments(baseFilter),
            mod.statusField
              ? mod.model.countDocuments({ ...baseFilter, [mod.statusField]: "draft" })
              : Promise.resolve(0),
            mod.statusField
              ? mod.model.countDocuments({ ...baseFilter, [mod.statusField]: "archived" })
              : Promise.resolve(0),
            mod.allowedFields.includes("verificationStatus")
              ? mod.model.countDocuments({ ...baseFilter, verificationStatus: { $ne: "verified" } })
              : Promise.resolve(null),
            mod.allowedFields.includes("sourceUrl")
              ? mod.model.countDocuments({
                  ...baseFilter,
                  $or: [{ sourceUrl: "" }, { sourceUrl: null }, { sourceUrl: { $exists: false } }],
                })
              : Promise.resolve(null),
            mod.model.countDocuments({
              ...baseFilter,
              updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            }),
          ]);

        results.push({
          module: mod.key,
          label: mod.label,
          category: mod.category,
          total,
          published,
          draft,
          archived,
          unverified,
          missingSource,
          recentlyModified,
        });
      } catch (e) {
        results.push({ module: mod.key, label: mod.label, category: mod.category, error: "Health check failed" });
      }
    }
    res.json({ success: true, data: { modules: results } });
  },
);

module.exports = router;
