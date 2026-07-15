const router = require("express").Router();

const {
  getTribunals,
  getTribunalById,
  createTribunal,
  updateTribunal,
  deleteTribunal,
} = require("../controllers/tribunalController");

// GET /api/tribunals
router.get("/", getTribunals);

// GET /api/tribunals/:id
router.get("/:id", getTribunalById);

// POST /api/tribunals
router.post("/", createTribunal);

// PUT /api/tribunals/:id
router.put("/:id", updateTribunal);

// DELETE /api/tribunals/:id
router.delete("/:id", deleteTribunal);

module.exports = router;
