/**
 * Admin CMS routes — /api/admin/cms/*
 *
 * Every route enforces: authenticate -> admin authorization ->
 * granular permission authorization -> registry allowlist -> engine -> audit.
 */
const router = require("express").Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { checkPermission } = require("../middleware/adminAuth");
const cms = require("../admin/controllers/cmsController");

router.use(auth, adminAuth);

// Module metadata (any authenticated admin; UI filters by permissions)
router.get("/_modules", cms.modules);

// NOTE: _modules must be declared before parameterized :module routes.
const view = (req, res, next) => {
  const { getModule } = require("../admin/registry/contentRegistry");
  const mod = getModule(req.params.module);
  if (!mod) return res.status(404).json({ success: false, message: "Unknown CMS module." });
  req.moduleDef = mod;
  next();
};

const perm = (action) => (req, res, next) =>
  checkPermission(`${req.moduleDef.permissionKey}.${action}`)(req, res, next);

router.get("/:module", view, perm("view"), cms.list);
router.get("/:module/:id", view, perm("view"), cms.get);
router.post("/:module", view, perm("create"), cms.create);
router.put("/:module/:id", view, perm("edit"), cms.update);
router.patch("/:module/:id/status", view, perm("edit"), cms.statusAction);
router.delete("/:module/:id", view, perm("delete"), cms.remove);

module.exports = router;
