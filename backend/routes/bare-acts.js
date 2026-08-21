const router = require("express").Router();

const {
  getBareActs,
  getBareActById,
  searchBareActs,
  getBareActsByCategory,
} = require("../controllers/bareActController");

// GET /api/bare-acts
// Backward compatibility: still returns `success`, `count`, and `bareActs`.
// Adds optional pagination/sorting/search via query params.
router.get("/", getBareActs);

// GET /api/bare-acts/search?q=
router.get("/search", searchBareActs);

// GET /api/bare-acts/category/:category
router.get("/category/:category", getBareActsByCategory);

// GET /api/bare-acts/:id
router.get("/:id", getBareActById);

module.exports = router;


