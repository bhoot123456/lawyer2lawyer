/**
 * Public routes for the Delhi Police Stations Directory.
 * No authentication required — these endpoints serve the public-facing
 * legal directory used by lawyers on the Lawyer2Lawyer platform.
 *
 * Admin write endpoints live under /api/admin/police-stations (see routes/admin.js).
 */

const router = require("express").Router();
const policeStationController = require("../controllers/policeStationController");

// ── Public Read ─────────────────────────────────────────────────────────

// GET /api/police-stations — List all published stations (with filters + pagination)
router.get("/", policeStationController.listStations);

// GET /api/police-stations/search?q=... — Search stations
// NOTE: "search" must be registered before "/:id" to avoid route shadowing.
router.get("/search", policeStationController.searchStations);

// GET /api/police-stations/districts — Unique districts
// NOTE: Must be before "/district/:district" to avoid shadowing.
router.get("/districts", policeStationController.getDistricts);

// GET /api/police-stations/subdivisions — Unique subdivisions
router.get("/subdivisions", policeStationController.getSubdivisions);

// GET /api/police-stations/types — Unique station types
router.get("/types", policeStationController.getTypes);

// GET /api/police-stations/district/:district — Stations in a district
router.get("/district/:district", policeStationController.getStationsByDistrict);

// GET /api/police-stations/subdivision/:subdivision — Stations in a subdivision
router.get("/subdivision/:subdivision", policeStationController.getStationsBySubdivision);

// GET /api/police-stations/:id — Single station detail
// Must be LAST — dynamic param would shadow all above.
router.get("/:id", policeStationController.getStationById);

module.exports = router;
