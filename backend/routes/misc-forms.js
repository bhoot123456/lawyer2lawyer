const router = require("express").Router();
const staticMiscForms = require("../data/miscForms");
const MiscForm = require("../models/MiscForm");

/**
 * GET /api/misc-forms
 * MongoDB is the runtime source of truth. Rebuilds the original grouped shape
 * ({ success, count, categories: [{ category, items: [{ name, url }] }] }).
 * Falls back to the static dataset until the migration has been run.
 */
async function buildCategoriesFromDb() {
  const forms = await MiscForm.find({ status: "published", isDeleted: { $ne: true } })
    .sort({ category: 1, displayOrder: 1 })
    .lean();

  if (!forms.length) return null;

  const map = new Map();
  for (const f of forms) {
    if (!map.has(f.category)) map.set(f.category, []);
    map.get(f.category).push({
      name: f.name,
      url: f.url,
      ...(f.description ? { description: f.description } : {}),
    });
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
}

// GET all Misc Forms grouped by category
router.get("/", async (req, res) => {
  try {
    let categories = await buildCategoriesFromDb();
    if (!categories) categories = staticMiscForms;

    res.status(200).json({
      success: true,
      count: categories.reduce((acc, c) => acc + (c.items?.length || 0), 0),
      categories,
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

