const router = require("express").Router();
const revenueCourtPhase8 = require("../data/revenueCourtPhase8");

// GET Phase 8 – Revenue Court knowledge data
router.get("/phase8", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      ...revenueCourtPhase8,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch revenue court data",
    });
  }
});

module.exports = router;

