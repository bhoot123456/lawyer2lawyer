const router = require("express").Router();
const knowledgeHubPhase10 = require("../data/knowledgeHub");

// GET Phase 10 – Knowledge Hub data
router.get("/", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      ...knowledgeHubPhase10,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch knowledge hub data",
    });
  }
});

module.exports = router;