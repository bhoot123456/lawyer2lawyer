const JudgeDirectory = require("../models/JudgeDirectory");

// Escape user-controlled search input before it reaches $regex so that
// regex metacharacters cannot alter query semantics or enable ReDoS.
const escapeRegex = (str) => String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Public endpoint: Get all published judges for a given courtId.
 * Supports optional search query param.
 */
exports.getJudgesByCourt = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { search } = req.query;

    if (!courtId) {
      return res.status(400).json({
        success: false,
        message: "courtId is required",
      });
    }

    const filter = {
      courtId,
      status: "published",
    };

    if (search && search.trim()) {
      const q = escapeRegex(search.trim());
      filter.$or = [
        { judgeName: { $regex: q, $options: "i" } },
        { courtRoom: { $regex: q, $options: "i" } },
        { courtName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const judges = await JudgeDirectory.find(filter)
      .sort({ displayOrder: 1, courtRoom: 1 })
      .select(
        "courtId courtName courtRoom bench judgeName vcLink meetingId email displayOrder",
      );

    res.json({
      success: true,
      data: {
        judges,
        total: judges.length,
        courtId,
      },
    });
  } catch (error) {
    console.error("getJudgesByCourt error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch judges",
    });
  }
};

/**
 * Public endpoint: Get a single judge by ID
 */
exports.getJudgeById = async (req, res) => {
  try {
    const judge = await JudgeDirectory.findById(req.params.id);

    if (!judge) {
      return res.status(404).json({
        success: false,
        message: "Judge not found",
      });
    }

    // Only return published judges via public endpoint
    if (judge.status !== "published") {
      return res.status(404).json({
        success: false,
        message: "Judge not found",
      });
    }

    res.json({
      success: true,
      data: judge,
    });
  } catch (error) {
    console.error("getJudgeById error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch judge",
    });
  }
};

