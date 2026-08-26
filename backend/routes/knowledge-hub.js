const router = require("express").Router();
const staticKnowledgeHub = require("../data/knowledgeHub");
const KnowledgeHubItem = require("../models/KnowledgeHubItem");

/**
 * GET /api/knowledge-hub
 * MongoDB is the runtime source of truth. Rebuilds the original response
 * shape ({ success, lastUpdatedNote, sections: [...] }) from admin-managed
 * records. Falls back to the static dataset until the migration has run.
 */
async function buildHubFromDb() {
  const items = await KnowledgeHubItem.find({ status: "published", isDeleted: { $ne: true } })
    .sort({ sectionKey: 1, displayOrder: 1 })
    .lean();

  if (!items.length) return null;

  const sectionsMap = new Map();
  for (const item of items) {
    if (!sectionsMap.has(item.sectionKey)) {
      sectionsMap.set(item.sectionKey, {
        key: item.sectionKey,
        title: item.sectionTitle || item.sectionKey,
        icon: item.sectionIcon || "link-outline",
        description: item.sectionDescription || "",
        resources: [],
      });
    }
    const section = sectionsMap.get(item.sectionKey);
    // Section metadata may be updated on any record; prefer non-empty values.
    if (item.sectionTitle) section.title = item.sectionTitle;
    if (item.sectionIcon) section.icon = item.sectionIcon;
    if (item.sectionDescription) section.description = item.sectionDescription;
    section.resources.push({ label: item.label, url: item.url });
  }

  return { sections: Array.from(sectionsMap.values()) };
}

router.get("/", async (req, res) => {
  try {
    const hub = await buildHubFromDb();
    const payload =
      hub && hub.sections.length > 0
        ? { lastUpdatedNote: staticKnowledgeHub.lastUpdatedNote, ...hub }
        : staticKnowledgeHub;

    res.status(200).json({
      success: true,
      ...payload,
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
