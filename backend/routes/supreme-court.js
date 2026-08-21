const router = require("express").Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const supremeCourtController = require("../controllers/supremeCourtController");

// GET /api/supreme-court/court-list - Get all court rooms with filtering & pagination (public read)
router.get("/court-list", supremeCourtController.getCourtList);

// POST /api/supreme-court/court-list/:id/favourite - Toggle favourite status
router.post("/court-list/:id/favourite", supremeCourtController.toggleFavourite);

// POST /api/supreme-court/seed - Seed database
// SECURITY: Seeding is a destructive operation (deletes & re-inserts data).
// It is no longer exposed as a public API. Guarded with the existing
// authentication + admin authorization middleware. Prefer running seed data via
// the server/CLI scripts (see `npm run seed`) instead of this route.
router.post("/seed", auth, adminAuth, supremeCourtController.seedData);

module.exports = router;
