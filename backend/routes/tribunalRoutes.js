const router = require("express").Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const {
  getTribunals,
  getTribunalById,
  createTribunal,
  updateTribunal,
  deleteTribunal,
} = require("../controllers/tribunalController");

// Public read endpoints — remain public (no authentication required).
// GET /api/tribunals
router.get("/", getTribunals);

// GET /api/tribunals/:id
router.get("/:id", getTribunalById);

// Write operations require an authenticated admin user
// (existing authentication + admin authorization middleware).
// Public (anonymous) write requests are rejected with 401/403.
// POST /api/tribunals
router.post("/", auth, adminAuth, createTribunal);

// PUT /api/tribunals/:id
router.put("/:id", auth, adminAuth, updateTribunal);

// DELETE /api/tribunals/:id
router.delete("/:id", auth, adminAuth, deleteTribunal);

module.exports = router;
