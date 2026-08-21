const mongoose = require("mongoose");

const BareActRecentlyOpened = require("../models/BareActRecentlyOpened");
const BareAct = require("../models/BareAct");

const ITEMS_LIMIT = 20;

async function upsertRecentlyOpened({ userId, bareActId }) {
  // Ensure act exists (prevents stale ids).
  const bareActExists = await BareAct.exists({ _id: bareActId });
  if (!bareActExists) return;

  const now = new Date();

  await BareActRecentlyOpened.findOneAndUpdate(
    { user: userId, bareAct: bareActId },
    {
      $set: { lastOpenedAt: now },
      $inc: { openCount: 1 },
    },
    { upsert: true, new: true },
  );

  // Keep only latest N per user (by lastOpenedAt)
  // We delete the oldest rows for this user.
  const idsToKeep = await BareActRecentlyOpened.find({ user: userId })
    .sort({ lastOpenedAt: -1 })
    .limit(ITEMS_LIMIT)
    .select("_id")
    .lean();

  const keepSet = new Set(idsToKeep.map((d) => String(d._id)));

  await BareActRecentlyOpened.deleteMany({
    user: userId,
    _id: { $nin: Array.from(keepSet) },
  });
}

async function trackRecentOpen(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { id } = req.params;



    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid bare act id" });
    }

    const bareActExists = await BareAct.exists({ _id: id });



    // Fire-and-forget style: do work but return quickly.
    // (Client also won't block PDF open.)
    await upsertRecentlyOpened({ userId, bareActId: id });

    // TEMP DEBUG (remove after runtime issue found)
    const count = await require('../models/BareActRecentlyOpened').countDocuments({ user: userId });
    if (String(req?.originalUrl || '').includes('/bare-acts/recent')) {
      console.log('[recentlyOpened][trackRecentOpen] BareActRecentlyOpened count for user:', count);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Cannot track recently opened", error: error?.message });
  }
}

async function getRecentlyOpened(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const items = await BareActRecentlyOpened.find({ user: userId })
      .sort({ lastOpenedAt: -1 })
      .limit(ITEMS_LIMIT)
      .populate({
        path: "bareAct",
        select: "_id slug title actName shortName pdfUrl category year indiaCodeUrl pdfVerificationStatus indiaCodeSearchUrl",
      })
      .lean();

    const recentBareActs = items
      .map((it) => it?.bareAct)
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: { bareActs: recentBareActs },
      bareActs: recentBareActs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Cannot fetch recently opened", error: error?.message });
  }
}

module.exports = {
  trackRecentOpen,
  getRecentlyOpened,
};

