/**
 * Admin CMS controller — thin HTTP layer over the registry-driven CRUD engine.
 * Route chain for every endpoint:
 *   auth -> adminAuth -> checkPermission(<module>.<action>) -> validation/engine -> audit
 */
const { getModule } = require("../registry/contentRegistry");
const crudEngine = require("../services/crudEngine");
const { HttpError } = require("../services/crudEngine");

function resolveModule(req) {
  const mod = getModule(req.params.module);
  if (!mod) {
    throw new HttpError(404, `Unknown CMS module "${req.params.module}".`);
  }
  return mod;
}

function sendError(res, err) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, message: err.message, ...(err.extra || {}) });
  }
  console.error("CMS error:", err);
  return res.status(500).json({ success: false, message: "Internal server error" });
}

exports.list = async (req, res) => {
  try {
    const mod = resolveModule(req);
    const result = await crudEngine.listRecords(mod, req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    sendError(res, err);
  }
};

exports.get = async (req, res) => {
  try {
    const mod = resolveModule(req);
    const item = await crudEngine.getRecord(mod, req.params.id);
    res.json({ success: true, data: item });
  } catch (err) {
    sendError(res, err);
  }
};

exports.create = async (req, res) => {
  try {
    const mod = resolveModule(req);
    const item = await crudEngine.createRecord(mod, req.body, req.user, req);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    sendError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const mod = resolveModule(req);
    const item = await crudEngine.updateRecord(mod, req.params.id, req.body, req.user, req);
    res.json({ success: true, data: item });
  } catch (err) {
    sendError(res, err);
  }
};

exports.statusAction = async (req, res) => {
  try {
    const mod = resolveModule(req);
    const action = String((req.body && req.body.action) || "").toLowerCase();
    if (!action) throw new HttpError(400, "Missing action.");
    const item = await crudEngine.applyStatusAction(mod, req.params.id, action, req.body, req.user, req);
    res.json({ success: true, data: item });
  } catch (err) {
    sendError(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    const mod = resolveModule(req);
    const result = await crudEngine.deleteRecord(mod, req.params.id, req.user, req);
    res.json({ success: true, data: result });
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * Compute the CMS module list for a specific authenticated admin.
 *
 * SECURITY (Part 4 / Part 20):
 *   - Modules are returned ONLY when the caller holds an EXPLICIT view grant
 *     (`<permissionKey>.view === true`, super admin bypasses). A frontend that
 *     guesses a module key gains nothing: the backend enforces the same check
 *     again on every /:module request.
 *   - Per-action booleans are derived server-side from req.user — never from
 *     anything the client sent.
 *
 * Exported separately so it can be unit-tested without HTTP.
 */
function computeAuthorizedModules(user) {
  const { listModules } = require("../registry/contentRegistry");
  const { hasExplicitPermission } = require("../permissions/registry");
  const { isSuperAdmin } = require("../../middleware/adminAuth");

  const can = (p) => !!user && (isSuperAdmin(user) || hasExplicitPermission(user.permissions, p));

  return listModules()
    .filter((m) => can(`${m.permissionKey}.view`))
    .map((m) => ({
      ...m,
      permissions: {
        view: true,
        create: can(`${m.permissionKey}.create`),
        edit: can(`${m.permissionKey}.edit`),
        publish: !!(m.supportsPublish && can(`${m.permissionKey}.publish`)),
        // Archiving is exposed through the status endpoint guarded by `.edit`.
        archive: m.deletePolicy !== "hard" ? can(`${m.permissionKey}.edit`) : false,
        delete: can(`${m.permissionKey}.delete`),
      },
    }));
}

/** Module metadata for building the permission-aware dashboard. */
exports.modules = (req, res) => {
  res.json({ success: true, data: { modules: computeAuthorizedModules(req.user) } });
};

exports.computeAuthorizedModules = computeAuthorizedModules;
