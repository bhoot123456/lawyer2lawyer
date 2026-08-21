const router = require("express").Router();
const districtCourtJudgesController = require("../controllers/districtCourtJudgesController");

// Public endpoints — no auth required

// GET /api/district-courts/:complexId/:districtId/judges
// Returns all published judges for a district, sorted by displayOrder
router.get(
  "/:complexId/:districtId/judges",
  districtCourtJudgesController.getJudgesByDistrict,
);

// GET /api/district-courts/:complexId/:districtId/judges-on-leave
// Returns all published judges on leave for a district, sorted by displayOrder
router.get(
  "/:complexId/:districtId/judges-on-leave",
  districtCourtJudgesController.getJudgesOnLeave,
);

// GET /api/district-courts/:complexId/:districtId/judges/:id
// Returns a single published judge by ID
router.get(
  "/:complexId/:districtId/judges/:id",
  districtCourtJudgesController.getJudgeById,
);

module.exports = router;

