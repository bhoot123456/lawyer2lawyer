const router = require("express").Router();

const authMiddleware = require("../middleware/auth");

const {
  trackRecentOpen,
  getRecentlyOpened,
} = require("../controllers/bareActsRecentlyOpenedController");

// Important: this router mounts under `/api/bare-acts`.
// Order matters only if there are conflicting routes inside this router.

// GET /api/bare-acts/recent
router.get("/recent", authMiddleware, getRecentlyOpened);

// Also support clients that might call `/api/bare-acts/recent/` with trailing slash.
router.get("/recent/", authMiddleware, getRecentlyOpened);


// POST /api/bare-acts/recent/open/:id
// Internal endpoint used by mobile app when user opens a PDF.
router.post("/recent/open/:id", authMiddleware, trackRecentOpen);


module.exports = router;

