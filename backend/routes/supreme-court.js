const router = require("express").Router();
const supremeCourtController = require("../controllers/supremeCourtController");

// GET /api/supreme-court/court-list - Get all court rooms with filtering & pagination
router.get("/court-list", supremeCourtController.getCourtList);

// POST /api/supreme-court/court-list/:id/favourite - Toggle favourite status
router.post("/court-list/:id/favourite", supremeCourtController.toggleFavourite);

// POST /api/supreme-court/seed - Seed database
router.post("/seed", supremeCourtController.seedData);

module.exports = router;