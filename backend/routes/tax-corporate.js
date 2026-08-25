const router = require("express").Router();
const taxCorporate = require("../data/taxCorporate");

// GET Phase 9 – Tax & Corporate knowledge data
router.get("/", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      ...taxCorporate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch tax & corporate data",
    });
  }
});

module.exports = router;

