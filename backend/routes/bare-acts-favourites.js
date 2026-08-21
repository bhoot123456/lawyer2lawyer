const router = require("express").Router();

const authMiddleware = require("../middleware/auth");

const {
  getFavourites,
  addFavourite,
  removeFavourite,
} = require("../controllers/bareActFavouritesController");

// GET /api/bare-acts/favourites
router.get("/favourites", authMiddleware, getFavourites);

// POST /api/bare-acts/favourites/:id
router.post("/favourites/:id", authMiddleware, addFavourite);

// DELETE /api/bare-acts/favourites/:id
router.delete("/favourites/:id", authMiddleware, removeFavourite);

module.exports = router;

