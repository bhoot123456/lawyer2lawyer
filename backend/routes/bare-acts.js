const router = require("express").Router();
const bareActs = require("../data/bareActs");

// GET all Bare Acts (title + pdfUrl)
router.get("/", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: bareActs.length,
      bareActs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch bare acts",
    });
  }
});

module.exports = router;
