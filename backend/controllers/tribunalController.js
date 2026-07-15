const Tribunal = require("../models/Tribunal");

// GET all tribunals
const getTribunals = async (req, res) => {
  try {
    const tribunals = await Tribunal.find({});
    res.status(200).json({
      success: true,
      count: tribunals.length,
      tribunals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch tribunals",
    });
  }
};

// GET tribunal by id
const getTribunalById = async (req, res) => {
  try {
    const { id } = req.params;
    const tribunal = await Tribunal.findById(id);

    if (!tribunal) {
      return res.status(404).json({
        success: false,
        message: "Tribunal not found",
      });
    }

    res.status(200).json({
      success: true,
      tribunal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch tribunal",
    });
  }
};

// POST new tribunal
const createTribunal = async (req, res) => {
  try {
    const {
      name,
      abbreviation,
      category,
      jurisdiction,
      description,
      location,
      website,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required",
      });
    }

    const tribunal = await Tribunal.create({
      name,
      abbreviation,
      category,
      jurisdiction,
      description,
      location,
      website,
    });

    res.status(201).json({
      success: true,
      tribunal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot create tribunal",
    });
  }
};

// PUT update tribunal
const updateTribunal = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      abbreviation,
      category,
      jurisdiction,
      description,
      location,
      website,
    } = req.body;

    const tribunal = await Tribunal.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined ? { name } : {}),
        ...(abbreviation !== undefined ? { abbreviation } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(jurisdiction !== undefined ? { jurisdiction } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(website !== undefined ? { website } : {}),
      },
      { new: true },
    );

    if (!tribunal) {
      return res.status(404).json({
        success: false,
        message: "Tribunal not found",
      });
    }

    res.status(200).json({
      success: true,
      tribunal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot update tribunal",
    });
  }
};

// DELETE tribunal
const deleteTribunal = async (req, res) => {
  try {
    const { id } = req.params;
    const tribunal = await Tribunal.findByIdAndDelete(id);

    if (!tribunal) {
      return res.status(404).json({
        success: false,
        message: "Tribunal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tribunal deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot delete tribunal",
    });
  }
};

module.exports = {
  getTribunals,
  getTribunalById,
  createTribunal,
  updateTribunal,
  deleteTribunal,
};
