const mongoose = require("mongoose");

const BareActFavourite = require("../models/BareActFavourite");
const BareAct = require("../models/BareAct");

function isValidObjectId(id) {
  return !!id && mongoose.Types.ObjectId.isValid(id);
}

function pickBareActId(favouriteDoc) {
  // Ensure we return bareAct id even if populated.
  const bareAct = favouriteDoc?.bareAct;
  if (!bareAct) return null;
  if (typeof bareAct === "string") return bareAct;
  if (bareAct?._id) return String(bareAct._id);
  return String(bareAct);
}

async function getFavourites(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const favourites = await BareActFavourite.find({ user: userId }).select("bareAct");
    const bareActIds = favourites
      .map(pickBareActId)
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: { bareActIds },
      bareActIds,
    });
  } catch (error) {
    console.error("getFavourites error", error);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch bare act favourites",
      error: error?.message,
    });
  }
}

async function addFavourite(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid bare act id" });
    }

    // Ensure bare act exists.
    const bareActExists = await BareAct.exists({ _id: id });
    if (!bareActExists) {
      return res.status(404).json({ success: false, message: "Bare act not found" });
    }

    const created = await BareActFavourite.create({ user: userId, bareAct: id });

    return res.status(201).json({
      success: true,
      data: { bareActId: String(created.bareAct) },
      bareActId: String(created.bareAct),
    });
  } catch (error) {
    // Duplicate key => already favourited.
    if (error?.code === 11000) {
      return res.status(200).json({
        success: true,
        data: { alreadyExists: true },
        alreadyExists: true,
      });
    }

    console.error("addFavourite error", error);
    return res.status(500).json({
      success: false,
      message: "Cannot add bare act favourite",
      error: error?.message,
    });
  }
}

async function removeFavourite(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid bare act id" });
    }

    const deleted = await BareActFavourite.findOneAndDelete({ user: userId, bareAct: id });

    return res.status(200).json({
      success: true,
      data: { deleted: !!deleted },
      deleted: !!deleted,
    });
  } catch (error) {
    console.error("removeFavourite error", error);
    return res.status(500).json({
      success: false,
      message: "Cannot remove bare act favourite",
      error: error?.message,
    });
  }
}

module.exports = {
  getFavourites,
  addFavourite,
  removeFavourite,
};

