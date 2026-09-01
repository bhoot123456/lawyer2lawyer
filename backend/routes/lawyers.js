const router = require("express").Router();
const User = require("../models/User");

// GET ALL LAWYERS + FILTERS

router.get("/", async (req, res) => {
  try {
    const { state, city, specialization } = req.query;

    const filter = {
      role: "lawyer",
    };

    if (state) {
      filter.state = state;
    }

    if (city) {
      filter.city = city;
    }

    // Validate query lengths
    if (typeof specialization === "string" && specialization.length > 60) {
      return res.status(400).json({ message: "specialization is too long" });
    }

    if (typeof state === "string" && state.length > 60) {
      return res.status(400).json({ message: "state is too long" });
    }

    if (typeof city === "string" && city.length > 60) {
      return res.status(400).json({ message: "city is too long" });
    }

    if (specialization) {
      filter.specialization = {
        $regex: specialization,
        $options: "i",
      };
    }

    const lawyers = await User.find(filter).select(
      "name email role state city specialization phone about",
    );

    res.status(200).json({
      success: true,
      count: lawyers.length,
      lawyers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Cannot fetch lawyers",
    });
  }
});

// GET SINGLE LAWYER

router.get("/:id", async (req, res) => {
  try {
    const lawyer = await User.findById(req.params.id).select(
      "name email role state city specialization phone about",
    );

    if (!lawyer || lawyer.role !== "lawyer") {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    res.status(200).json({
      success: true,
      lawyer,
    });
  } catch (error) {
    console.error(error);

    const isCastError = error?.name === "CastError";
    res.status(isCastError ? 400 : 500).json({
      success: false,
      message: isCastError ? "Invalid lawyer identifier" : "Cannot fetch lawyer",
    });
  }
});

module.exports = router;
