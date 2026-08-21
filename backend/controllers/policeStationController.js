/**
 * Police Station Controller — Delhi Police Stations & Jurisdiction Directory
 *
 * Public endpoints (no auth): list, search, filter, single-station detail,
 * district/subdivision/types lookups.
 *
 * Admin endpoints (auth + adminAuth + checkPermission) are defined in
 * routes/admin.js and route through the same service layer.
 */

const policeStationService = require("../services/policeStationService");
const { validatePoliceStationPayload } = require("../validation/policeStationValidation");

const escapeRegex = (str) => String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ─────────────────────────────────────────────────────────────────────────
// PUBLIC READ
// ─────────────────────────────────────────────────────────────────────────

/**
 * GET /api/police-stations
 * Lightweight list with optional filtering + pagination.
 * Query params: search, district, subdivision, type, recentlyVerified,
 *               hasContact, hasCourt, page, limit, sortBy, sortOrder
 */
exports.listStations = async (req, res) => {
  try {
    const result = await policeStationService.listStations(req.query);

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("listStations error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load police stations",
    });
  }
};

/**
 * GET /api/police-stations/search?q=...&limit=...
 */
exports.searchStations = async (req, res) => {
  try {
    const { q, limit } = req.query;
    const query = String(q || "").trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query (q) is required",
      });
    }

    const result = await policeStationService.listStations({
      search: query,
      limit,
    });

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("searchStations error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};

/**
 * GET /api/police-stations/district/:district
 */
exports.getStationsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    const result = await policeStationService.listStations({
      district,
      limit: 200,
    });

    res.json({
      success: true,
      district,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("getStationsByDistrict error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load police stations for this district",
    });
  }
};

/**
 * GET /api/police-stations/subdivision/:subdivision
 */
exports.getStationsBySubdivision = async (req, res) => {
  try {
    const { subdivision } = req.params;
    const result = await policeStationService.listStations({
      subdivision,
      limit: 200,
    });

    res.json({
      success: true,
      subdivision,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("getStationsBySubdivision error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load police stations for this subdivision",
    });
  }
};

/**
 * GET /api/police-stations/districts
 * Returns unique district names.
 */
exports.getDistricts = async (req, res) => {
  try {
    const districts = await policeStationService.getDistricts();
    res.json({
      success: true,
      data: districts.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    });
  } catch (error) {
    console.error("getDistricts error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load districts",
    });
  }
};

/**
 * GET /api/police-stations/subdivisions
 * Returns unique subdivision names (optionally scoped by ?district=...)
 */
exports.getSubdivisions = async (req, res) => {
  try {
    const { district } = req.query;
    const subs = await policeStationService.getSubdivisions(district);
    res.json({
      success: true,
      data: subs,
    });
  } catch (error) {
    console.error("getSubdivisions error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load subdivisions",
    });
  }
};

/**
 * GET /api/police-stations/types
 */
exports.getTypes = async (req, res) => {
  try {
    const types = await policeStationService.getTypes();
    res.json({
      success: true,
      data: types.filter(Boolean),
    });
  } catch (error) {
    console.error("getTypes error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load types",
    });
  }
};

/**
 * GET /api/police-stations/:id
 */
exports.getStationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid police station ID",
      });
    }

    const station = await policeStationService.getStationById(id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Police station not found",
      });
    }

    res.json({
      success: true,
      data: station,
    });
  } catch (error) {
    console.error("getStationById error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load police station information",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// ADMIN CRUD — Police Stations
// ─────────────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/police-stations
 */
exports.createStationAdmin = async (req, res) => {
  try {
    const validation = validatePoliceStationPayload(req.body, false);
    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        details: validation.details,
      });
    }

    const station = await policeStationService.createStation(req.body);
    res.status(201).json({
      success: true,
      data: station,
    });
  } catch (error) {
    console.error("createStationAdmin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create police station",
    });
  }
};

/**
 * GET /api/admin/police-stations
 */
exports.listStationsAdmin = async (req, res) => {
  try {
    const { search, status, district, subdivision, page, limit, sortBy, sortOrder } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (district) filter.district = district;
    if (subdivision) filter.subdivision = subdivision;

    // Reuse service but without the public filter (admin sees everything)
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy || "name"]: sortOrder === "asc" ? 1 : -1 };

    const PoliceStation = require("../models/PoliceStation");

    let query = PoliceStation.find(filter);

    if (search && String(search).trim()) {
      const q = escapeRegex(search.trim());
      query = query.or([
        { name: { $regex: q, $options: "i" } },
        { district: { $regex: q, $options: "i" } },
        { subdivision: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ]);
    }

    const [items, total] = await Promise.all([
      query.sort(sort).skip(skip).limit(limitNum).lean(),
      PoliceStation.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        stations: items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.max(1, Math.ceil(total / limitNum)),
        },
      },
    });
  } catch (error) {
    console.error("listStationsAdmin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch police stations",
    });
  }
};

/**
 * GET /api/admin/police-stations/:id
 */
exports.getStationAdmin = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const PoliceStation = require("../models/PoliceStation");
    const station = await PoliceStation.findById(req.params.id).lean();
    if (!station) {
      return res.status(404).json({ success: false, message: "Police station not found" });
    }
    res.json({ success: true, data: station });
  } catch (error) {
    console.error("getStationAdmin error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch police station" });
  }
};

/**
 * PUT /api/admin/police-stations/:id
 */
exports.updateStationAdmin = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const validation = validatePoliceStationPayload(req.body, true);
    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        details: validation.details,
      });
    }

    const station = await policeStationService.updateStation(req.params.id, req.body);
    if (!station) {
      return res.status(404).json({ success: false, message: "Police station not found" });
    }
    res.json({ success: true, data: station });
  } catch (error) {
    console.error("updateStationAdmin error:", error);
    res.status(500).json({ success: false, message: "Failed to update police station" });
  }
};

/**
 * DELETE /api/admin/police-stations/:id
 * Archive (soft-delete) by default.
 */
exports.deleteStationAdmin = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const station = await policeStationService.archiveStation(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: "Police station not found" });
    }
    res.json({ success: true, message: "Police station archived successfully", data: station });
  } catch (error) {
    console.error("deleteStationAdmin error:", error);
    res.status(500).json({ success: false, message: "Failed to archive police station" });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// ADMIN CRUD — Hierarchy Offices
// ─────────────────────────────────────────────────────────────────────────

exports.listHierarchyOfficesAdmin = async (req, res) => {
  try {
    const { jurisdictionLevel, jurisdiction, designation, page, limit } = req.query;
    const result = await policeStationService.listHierarchyOffices({
      jurisdictionLevel,
      jurisdiction,
      designation,
      page,
      limit,
    });

    res.json({
      success: true,
      data: {
        offices: result.items,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    console.error("listHierarchyOfficesAdmin error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch hierarchy offices" });
  }
};

exports.createHierarchyOfficeAdmin = async (req, res) => {
  try {
    const { jurisdictionLevel, jurisdiction, designation } = req.body;
    if (!jurisdictionLevel || !jurisdiction || !designation) {
      return res.status(400).json({
        success: false,
        message: "jurisdictionLevel, jurisdiction, and designation are required",
      });
    }

    const office = await policeStationService.createHierarchyOffice(req.body);
    res.status(201).json({ success: true, data: office });
  } catch (error) {
    console.error("createHierarchyOfficeAdmin error:", error);
    res.status(500).json({ success: false, message: "Failed to create hierarchy office" });
  }
};

exports.updateHierarchyOfficeAdmin = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const office = await policeStationService.updateHierarchyOffice(req.params.id, req.body);
    if (!office) {
      return res.status(404).json({ success: false, message: "Hierarchy office not found" });
    }
    res.json({ success: true, data: office });
  } catch (error) {
    console.error("updateHierarchyOfficeAdmin error:", error);
    res.status(500).json({ success: false, message: "Failed to update hierarchy office" });
  }
};

exports.deleteHierarchyOfficeAdmin = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const office = await policeStationService.deleteHierarchyOffice(req.params.id);
    if (!office) {
      return res.status(404).json({ success: false, message: "Hierarchy office not found" });
    }
    res.json({ success: true, message: "Hierarchy office deleted successfully" });
  } catch (error) {
    console.error("deleteHierarchyOfficeAdmin error:", error);
    res.status(500).json({ success: false, message: "Failed to delete hierarchy office" });
  }
};
