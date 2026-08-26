const router = require("express").Router();
const staticCriminalLawActs = require("../data/criminalLawActs");
const CriminalLawAct = require("../models/CriminalLawAct");

/**
 * GET /api/criminal-law-acts
 * MongoDB is the runtime source of truth. The static file
 * (data/criminalLawActs.js) is only a fallback while the migration has not
 * been run yet, so the response contract never changes.
 */
router.get("/", async (req, res) => {
  try {
    let acts = await CriminalLawAct.find({ status: "published", isDeleted: { $ne: true } })
      .sort({ displayOrder: 1, title: 1 })
      .select("title actName category description pdfUrl -_id")
      .lean();

    if (!Array.isArray(acts) || acts.length === 0) {
      // Migration fallback: serve the immutable static dataset.
      acts = staticCriminalLawActs.map(({ title, actName, category, description, pdfUrl }) => ({
        title,
        actName,
        category,
        description,
        pdfUrl,
      }));
    }

    res.status(200).json({
      success: true,
      count: acts.length,
      criminalLawActs: acts,
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

