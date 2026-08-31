const SupremeCourt = require("../models/SupremeCourt");
const supremeCourtRooms = require("../data/supremeCourtData");

// Escape user-controlled search input before it reaches $regex so that
// regex metacharacters cannot alter query semantics or enable ReDoS.
const escapeRegex = (str) => String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * GET /api/supreme-court/court-list
 * Returns all supreme court rooms with optional filtering and pagination.
 */
exports.getCourtList = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = "displayOrder",
      order = "asc",
    } = req.query;

    // Build filter query
    const filter = {};

    if (status && ["Live", "Scheduled", "Offline"].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.courtRoom = { $regex: escapeRegex(search.trim()), $options: "i" };
    }

    // Try to fetch from DB first
    let courts = [];
    let total = 0;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const sortOrder = order === "desc" ? -1 : 1;

    try {
      const query = SupremeCourt.find(filter).sort({ [sortBy]: sortOrder });
      total = await SupremeCourt.countDocuments(filter);
      courts = await query
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();
    } catch (dbErr) {
      // If DB fails, fall back to seed data
      console.warn("[SupremeCourt] DB fetch failed, using seed data:", dbErr.message);
    }

    // Fallback to seed data if DB empty or errored
    if (!courts || courts.length === 0) {
      let filtered = [...supremeCourtRooms];

      if (status && ["Live", "Scheduled", "Offline"].includes(status)) {
        filtered = filtered.filter((c) => c.status === status);
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter((c) =>
          c.courtRoom.toLowerCase().includes(q)
        );
      }

      filtered.sort((a, b) => {
        const aVal = a[sortBy] ?? 0;
        const bVal = b[sortBy] ?? 0;
        return sortOrder === 1 ? aVal - bVal : bVal - aVal;
      });

      total = filtered.length;
      courts = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    }

    return res.status(200).json({
      success: true,
      data: courts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    });
  } catch (error) {
    console.error("[SupremeCourt] getCourtList error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch supreme court list",
    });
  }
};

/**
 * POST /api/supreme-court/court-list/:id/favourite
 * Toggle favourite status for a court room.
 */
exports.toggleFavourite = async (req, res) => {
  try {
    const { id } = req.params;

    // Try DB first
    let updated;
    try {
      const court = await SupremeCourt.findById(id);
      if (court) {
        court.isFavourite = !court.isFavourite;
        updated = await court.save();
        return res.status(200).json({
          success: true,
          data: updated,
        });
      }
    } catch (dbErr) {
      // ignore DB errors
    }

    // If not in DB, toggle in seed data (in-memory only)
    const seedIndex = supremeCourtRooms.findIndex(
      (c) => c._id === id || c.courtRoom === id
    );

    if (seedIndex !== -1) {
      supremeCourtRooms[seedIndex].isFavourite =
        !supremeCourtRooms[seedIndex].isFavourite;
      return res.status(200).json({
        success: true,
        data: supremeCourtRooms[seedIndex],
      });
    }

    return res.status(404).json({
      success: false,
      message: "Court room not found",
    });
  } catch (error) {
    console.error("[SupremeCourt] toggleFavourite error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle favourite",
    });
  }
};

/**
 * POST /api/supreme-court/seed
 * Seed the database with default court room data.
 */
exports.seedData = async (req, res) => {
  try {
    // Clear existing data
    await SupremeCourt.deleteMany({});

    // Insert seed data
    const inserted = await SupremeCourt.insertMany(supremeCourtRooms);

    return res.status(201).json({
      success: true,
      message: "Supreme court data seeded successfully",
      count: inserted.length,
    });
  } catch (error) {
    console.error("[SupremeCourt] seedData error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to seed data",
    });
  }
};