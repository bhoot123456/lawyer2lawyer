const router = require("express").Router();
const DraftTemplate = require("../models/DraftTemplate");
const draftLibraryPhase11 = require("../data/draftLibrary");

// Middleware: require auth (used for write/delete operations)
const auth = require("../middleware/auth");
// Optional auth for public/read endpoints that also work for anonymous users
const optionalAuth = require("../middleware/optionalAuth");

// GET Phase 11 – Draft Library data (template definitions)
router.get("/", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      ...draftLibraryPhase11,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch draft library data",
    });
  }
});

// GET user's saved drafts
// Public/read endpoint: anonymous (logged-out) users are allowed via optionalAuth and
// simply have no saved drafts. Authenticated users get their own drafts as before.
router.get("/saved", optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      // Anonymous user — no saved drafts to return
      return res.status(200).json({ success: true, drafts: [] });
    }

    const drafts = await DraftTemplate.find({ createdBy: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();
    res.status(200).json({ success: true, drafts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Cannot fetch saved drafts" });
  }
});

// POST save a draft (create or update)
router.post("/saved", auth, async (req, res) => {
  try {
    const { templateId, sectionKey, filledFields, customBody, title } = req.body;

    if (!templateId || !sectionKey) {
      return res.status(400).json({ success: false, message: "templateId and sectionKey are required" });
    }

    // Check if user already has a draft for this templateId (upsert)
    let draft = await DraftTemplate.findOne({
      createdBy: req.user._id,
      templateId,
    });

    if (draft) {
      draft.filledFields = filledFields || [];
      draft.customBody = customBody || "";
      if (title) draft.title = title;
    } else {
      draft = new DraftTemplate({
        title: title || templateId,
        templateId,
        sectionKey,
        filledFields: filledFields || [],
        customBody: customBody || "",
        createdBy: req.user._id,
      });
    }

    await draft.save();
    res.status(200).json({ success: true, draft });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Cannot save draft" });
  }
});

// DELETE a saved draft
router.delete("/saved/:id", auth, async (req, res) => {
  try {
    const draft = await DraftTemplate.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!draft) {
      return res.status(404).json({ success: false, message: "Draft not found" });
    }

    res.status(200).json({ success: true, message: "Draft deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Cannot delete draft" });
  }
});

module.exports = router;