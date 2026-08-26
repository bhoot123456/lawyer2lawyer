/**
 * ADMIN USER MANAGEMENT (Part 2 / 24 / 25)
 * ----------------------------------------
 * - List/search admins: requires admin_users.view (or super admin).
 * - All MUTATIONS (create/update/role change/permissions/suspend): SUPER ADMIN ONLY.
 * - No admin may escalate their own privileges: self-role/self-permission
 *   changes are rejected even for super admins editing themselves.
 * - Passwords are write-only; they are never returned by any endpoint.
 */
const User = require("../../models/User");
const { HttpError } = require("../services/crudEngine");
const { recordAudit, deepSanitize } = require("../audit/auditService");
const {
  ALL_PERMISSIONS,
  PERMISSION_SET,
  hasExplicitPermission,
} = require("../permissions/registry");
const { ADMIN_TYPES, isValidAdminType } = require("../permissions/roles");

const ADMIN_LIST_SELECT =
  "-password -documents -courts -states -ratings -totalReviews -consultationFee -availableForConsultation";

function ensureSuperAdmin(req) {
  if (!(req.user && req.user.adminType === "super_admin")) {
    throw new HttpError(403, "Only a super admin can manage administrator accounts.");
  }
}

function sanitizeAdmin(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  delete o.password;
  delete o.token;
  return o;
}

/** GET /admin-users — paginated, searchable, filterable admin directory. */
exports.listAdmins = async (req, res, next) => {
  try {
    const { search, status, adminType, page = "1", limit = "20", sortBy, sortOrder } = req.query;

    const filter = { role: "admin" };
    if (search) {
      const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }];
    }
    if (status === "active") { filter.isActive = true; filter.isSuspended = false; }
    if (status === "inactive") filter.isActive = false;
    if (status === "suspended") filter.isSuspended = true;
    if (adminType && isValidAdminType(adminType)) filter.adminType = adminType;

    const sortKeys = ["name", "email", "createdAt", "lastLoginAt"];
    const sKey = sortKeys.includes(sortBy) ? sortBy : "createdAt";
    const sort = { [sKey]: sortOrder === "asc" ? 1 : -1 };

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [admins, total] = await Promise.all([
      User.find(filter).select(ADMIN_LIST_SELECT).sort(sort).skip((p - 1) * l).limit(l).lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        admins,
        pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) || 1 },
      },
    });
  } catch (err) {
    next(err);
  }
};

/** POST /admin-users — create an administrator. */
exports.createAdmin = async (req, res, next) => {
  try {
    ensureSuperAdmin(req);
    const { name, email, password, adminType, state, city, phone, permissions } = req.body;

    if (!name || !email || !password) {
      throw new HttpError(400, "name, email and password are required.");
    }
    if (String(password).length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters.");
    }
    if (adminType !== undefined && !isValidAdminType(adminType)) {
      throw new HttpError(400, `Invalid adminType. Allowed: ${ADMIN_TYPES.join(", ")}`);
    }

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) throw new HttpError(409, "An account with this email already exists.");

    const bcrypt = require("bcryptjs");
    const hashed = await bcrypt.hash(String(password), 10);

    const doc = new User({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashed,
      role: "admin",
      adminType: adminType || "viewer",
      state: state || "Delhi",
      city: city || "New Delhi",
      phone: phone || "",
      permissions: {},
      isActive: true,
    });
    applyPermissionUpdates(doc, permissions || {});
    await doc.save();

    await recordAudit({
      admin: req.user,
      action: "ADMIN_CREATED",
      module: "admin_users",
      recordId: doc._id,
      recordLabel: doc.email,
      after: deepSanitize(sanitizeAdmin(doc)),
      changedFields: Object.keys(permissions || {}),
      req,
    });

    res.status(201).json({ success: true, data: sanitizeAdmin(doc) });
  } catch (err) {
    next(err);
  }
};

/** Validate + apply granular permission changes onto an admin document. */
function applyPermissionUpdates(doc, permissions) {
  const granted = [];
  const revoked = [];
  for (const [key, value] of Object.entries(permissions || {})) {
    if (!PERMISSION_SET.has(key)) {
      throw new HttpError(400, `Unknown permission "${key}".`);
    }
    if (value === true) {
      doc.permissions[key] = true;
      granted.push(key);
    } else if (value === false) {
      delete doc.permissions[key];
      revoked.push(key);
    } else {
      throw new HttpError(400, `Permission "${key}" must be true or false.`);
    }
  }
  // Mark Mixed path as modified so Mongoose persists the change.
  doc.markModified("permissions");
  return { granted, revoked };
}

exports.applyPermissionUpdates = applyPermissionUpdates;

/** GET /admin-users/:id */
exports.getAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: "admin" }).select(ADMIN_LIST_SELECT).lean();
    if (!admin) throw new HttpError(404, "Administrator not found.");
    res.json({ success: true, data: { admin, effectivePermissions: ALL_PERMISSIONS.filter((p) => hasExplicitPermission(admin.permissions, p)) } });
  } catch (err) { next(err); }
};

/** PUT /admin-users/:id — edit profile/role/permissions/status. */
exports.updateAdmin = async (req, res, next) => {
  try {
    ensureSuperAdmin(req);
    const target = await User.findOne({ _id: req.params.id, role: "admin" });
    if (!target) throw new HttpError(404, "Administrator not found.");

    const before = deepSanitize(sanitizeAdmin(target));
    const body = req.body || {};
    const isSelf = String(target._id) === String(req.user._id);
    const changedFields = [];

    // ── Anti-escalation guards ──────────────────────────────────────────
    if (isSelf && (body.adminType !== undefined && body.adminType !== target.adminType)) {
      throw new HttpError(403, "You cannot change your own administrative role.");
    }
    if (isSelf && body.permissions !== undefined) {
      throw new HttpError(403, "You cannot modify your own permission set.");
    }
    if (body.isActive === false || body.isSuspended === true) {
      const superAdminCount = await User.countDocuments({ role: "admin", adminType: "super_admin", isActive: true, isSuspended: false });
      if (target.adminType === "super_admin" && superAdminCount <= 1) {
        throw new HttpError(400, "Cannot deactivate or suspend the last active super admin.");
      }
    }

    // Profile fields
    for (const f of ["name", "phone", "state", "city"]) {
      if (body[f] !== undefined) { target[f] = String(body[f]).slice(0, 200); changedFields.push(f); }
    }

    // Role change (never on self)
    if (body.adminType !== undefined) {
      if (!isValidAdminType(body.adminType)) throw new HttpError(400, "Invalid adminType.");
      if (target.adminType === "super_admin" && body.adminType !== "super_admin") {
        const superAdminCount = await User.countDocuments({ role: "admin", adminType: "super_admin", isActive: true, isSuspended: false });
        if (superAdminCount <= 1) throw new HttpError(400, "Cannot demote the last active super admin.");
      }
      target.adminType = body.adminType;
      changedFields.push("adminType");
    }

    // Password reset by super admin (write-only, audited without value)
    if (body.password !== undefined) {
      if (String(body.password).length < 8) throw new HttpError(400, "Password must be at least 8 characters.");
      const bcrypt = require("bcryptjs");
      target.password = await bcrypt.hash(String(body.password), 10);
      changedFields.push("password");
    }

    let permResult = null;
    if (body.permissions !== undefined) {
      if (typeof body.permissions !== "object") throw new HttpError(400, "permissions must be an object.");
      permResult = applyPermissionUpdates(target, body.permissions);
      changedFields.push(...permResult.granted.map((p) => `+${p}`), ...permResult.revoked.map((p) => `-${p}`));
    }

    await target.save();

    // Status actions are folded into audit events for clarity.
    let action = "ADMIN_UPDATED";
    if (body.isActive === false) action = "ADMIN_DEACTIVATED";
    else if (body.isActive === true) action = "ADMIN_ACTIVATED";
    else if (body.isSuspended === true) action = "ADMIN_SUSPENDED";
    if (permResult && !permResult.granted.length && permResult.revoked.length) action = "PERMISSION_REVOKED";
    else if (permResult && permResult.granted.length && !permResult.revoked.length) action = "PERMISSION_GRANTED";

    if (body.isActive !== undefined) { target.isActive = !!body.isActive; changedFields.push("isActive"); }
    if (body.isSuspended !== undefined) { target.isSuspended = !!body.isSuspended; changedFields.push("isSuspended"); }
    if (changedFields.includes("isActive") || changedFields.includes("isSuspended")) await target.save();

    await recordAudit({
      admin: req.user,
      action,
      module: "admin_users",
      recordId: target._id,
      recordLabel: target.email,
      before,
      after: deepSanitize(sanitizeAdmin(target)),
      changedFields,
      req,
    });

    res.json({ success: true, data: sanitizeAdmin(target) });
  } catch (err) { next(err); }
};

/** Permission catalog for the Admin Users UI. */
exports.permissionCatalog = (req, res) => {
  const { getGroupedPermissions } = require("../permissions/registry");
  res.json({ success: true, data: { groups: getGroupedPermissions(), adminTypes: ADMIN_TYPES } });
};
