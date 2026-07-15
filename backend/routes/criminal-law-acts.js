const router = require("express").Router();
const criminalLawActs = require("../data/criminalLawActs");

// GET all Criminal Law Acts (title + pdfUrl)
router.get("/", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: criminalLawActs.length,
      criminalLawActs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch criminal law acts",
    });
  }
});

module.exports = router;
