const router = require("express").Router();
const miscForms = require("../data/miscForms");

// GET all Misc Forms grouped by category
router.get("/", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: miscForms.reduce((acc, c) => acc + (c.items?.length || 0), 0),
      categories: miscForms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch misc forms",
    });
  }
});

module.exports = router;
