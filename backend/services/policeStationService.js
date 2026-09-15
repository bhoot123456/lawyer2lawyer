/**
 * Police Station Service — Business logic for the Delhi Police directory.
 *
 * This service encapsulates all data-access logic, including:
 *  - Lightweight list queries (for the list page — no heavy payloads)
 *  - Single-station lookup (full detail)
 *  - District / subdivision / type filtering
 *  - Full-text search
 *  - Hierarchy office lookups (DCP, ACP/OPS, ACP/DIU, etc.)
 *
 * Public-read methods return only published + active records.
 * Write methods are called from the admin controller (protected by adminAuth).
 */

const PoliceStation = require("../models/PoliceStation");
const PoliceHierarchyOffice = require("../models/PoliceHierarchyOffice");
const DELHI_POLICE_STATIONS = require("../data/delhi-police-stations");
const mongoose = require("mongoose");

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Build a lightweight projection for list views — excludes embedded
 * sub-documents to keep payload small (performance rule).
 */
const LIST_PROJECTION =
  "name district subdivision type address pinCode phone email source lastVerified isActive createdAt updatedAt";

/**
 * Build a full projection for detail views.
 */
const DETAIL_PROJECTION =
  "name district subdivision type address pinCode phone email sho location source lastVerified sourceUrl isActive createdAt updatedAt";

/**
 * Common filter for published + active stations.
 */
const PUBLIC_FILTER = { status: "published", isActive: true };

// ─────────────────────────────────────────────────────────────────────────
// PUBLIC READ — List
// ─────────────────────────────────────────────────────────────────────────

/**
 * GET /api/police-stations
 * Lightweight list with optional filtering + pagination.
 */
async function listStations(params = {}) {
  const {
    search,
    district,
    subdivision,
    type,
    recentlyVerified,
    hasContact,
    hasCourt,
    page = 1,
    limit = 50,
    sortBy = "name",
    sortOrder = "asc",
  } = params;

  const filter = { ...PUBLIC_FILTER };

  // --- Search (text index or regex fallback) ---
  const q = search && String(search).trim();
  if (q) {
    filter.$text = { $search: q };
  }

  // --- Filters ---
  if (district) {
    filter.district = { $regex: String(district), $options: "i" };
  }
  if (subdivision) {
    filter.subdivision = { $regex: String(subdivision), $options: "i" };
  }
  if (type) {
    filter.type = { $regex: String(type), $options: "i" };
  }

  // --- Boolean filters ---
  if (recentlyVerified === "true" || recentlyVerified === true) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);
    filter.lastVerified = { $gte: cutoff };
  }

  if (hasContact === "true" || hasContact === true) {
    filter.$or = [
      { phone: { $ne: null, $ne: "" } },
      { email: { $ne: null, $ne: "" } },
    ];
  }

  // hasCourt — for now, court info is not stored on station documents.
  // This filter is accepted for API compatibility; it will simply return
  // all stations when true (court data will be added per-jurisdiction).
  if (hasCourt === "true" || hasCourt === true) {
    // No-op: court jurisdiction is modelled separately in the details page.
    // Keeping the filter accepted so the UI doesn't error.
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy === "name" ? "name" : sortBy]: sortOrder === "desc" ? -1 : 1 };

  let items = [];
  let total = 0;

  if (isDbConnected()) {
    try {
      const [dbItems, dbTotal] = await Promise.all([
        PoliceStation.find(filter)
          .sort(q ? { score: { $meta: "textScore" }, ...sort } : sort)
          .skip(skip)
          .limit(limitNum)
          .select(LIST_PROJECTION)
          .lean(),
        PoliceStation.countDocuments(filter),
      ]);
      items = dbItems;
      total = dbTotal;
    } catch (_err) {
      console.warn("DB query failed in listStations, falling back to static dataset.");
    }
  }

  if (items.length === 0 && DELHI_POLICE_STATIONS && DELHI_POLICE_STATIONS.length > 0) {
    let filtered = [...DELHI_POLICE_STATIONS];
    if (q) {
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(q.toLowerCase()) ||
          s.district?.toLowerCase().includes(q.toLowerCase()) ||
          s.subdivision?.toLowerCase().includes(q.toLowerCase())
      );
    }
    if (district) {
      filtered = filtered.filter((s) => s.district?.toLowerCase().includes(String(district).toLowerCase()));
    }
    total = filtered.length;
    items = filtered.slice(skip, skip + limitNum);
  }

  const totalPages = Math.max(1, Math.ceil(total / limitNum));

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasMore: pageNum * limitNum < total,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// PUBLIC READ — Single
// ─────────────────────────────────────────────────────────────────────────

/**
 * GET /api/police-stations/:id
 * Full detail for a single published station.
 */
async function getStationById(id) {
  let station = null;
  if (isDbConnected()) {
    try {
      station = await PoliceStation.findById(id)
        .where({ ...PUBLIC_FILTER })
        .select(DETAIL_PROJECTION)
        .lean();
    } catch (_e) {}
  }

  if (!station) {
    station = DELHI_POLICE_STATIONS.find((s) => s._id === id || s.name?.toLowerCase() === id?.toLowerCase()) || null;
  }

  if (!station) {
    return null;
  }

  // Fetch hierarchy-level officers for this station's district and subdivision.
  const [districtOffices, subdivisionOffices] = await Promise.all([
    PoliceHierarchyOffice.find({
      jurisdictionLevel: "district",
      jurisdiction: { $regex: `^${escapeRegex(station.district)}$`, $options: "i" },
      status: "published",
      isActive: true,
    }).sort({ displayOrder: 1, designation: 1 }).lean(),

    PoliceHierarchyOffice.find({
      jurisdictionLevel: "subdivision",
      jurisdiction: { $regex: `^${escapeRegex(station.subdivision)}$`, $options: "i" },
      status: "published",
      isActive: true,
    }).sort({ displayOrder: 1, designation: 1 }).lean(),
  ]);

  return { ...station, hierarchyOffices: { district: districtOffices, subdivision: subdivisionOffices } };
}

// ─────────────────────────────────────────────────────────────────────────
// PUBLIC READ — Aggregations (for filters)
// ─────────────────────────────────────────────────────────────────────────

/**
 * GET /api/police-stations/districts
 * Returns the list of unique districts.
 */
async function getDistricts() {
  return PoliceStation.distinct("district", PUBLIC_FILTER);
}

/**
 * GET /api/police-stations/subdivisions
 * Returns unique subdivisions, optionally scoped to a district.
 */
async function getSubdivisions(district) {
  const filter = { ...PUBLIC_FILTER };
  if (district) {
    filter.district = { $regex: String(district), $options: "i" };
  }
  const subs = await PoliceStation.distinct("subdivision", filter);
  return subs.filter(Boolean).sort((a, b) => a.localeCompare(b));
}

/**
 * GET /api/police-stations/types
 * Returns unique station types.
 */
async function getTypes() {
  return PoliceStation.distinct("type", PUBLIC_FILTER);
}

// ─────────────────────────────────────────────────────────────────────────
// PUBLIC READ — Search endpoint (convenience)
// ─────────────────────────────────────────────────────────────────────────

/**
 * GET /api/police-stations/search?q=...
 * Simple search wrapper that delegates to listStations.
 */
async function searchStations(query) {
  return listStations({ search: query, limit: 100 });
}

// ─────────────────────────────────────────────────────────────────────────
// ADMIN WRITE — CRUD operations
// ─────────────────────────────────────────────────────────────────────────

/**
 * Create a new police station. (Admin-only)
 */
async function createStation(data) {
  const station = new PoliceStation(data);
  return station.save();
}

/**
 * Update an existing police station. (Admin-only)
 */
async function updateStation(id, updates) {
  return PoliceStation.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
}

/**
 * Archive (soft-delete) a police station. (Admin-only)
 */
async function archiveStation(id) {
  return PoliceStation.findByIdAndUpdate(
    id,
    { $set: { status: "archived", isActive: false } },
    { new: true },
  );
}

/**
 * Permanently delete a police station. (Admin-only)
 */
async function deleteStation(id) {
  return PoliceStation.findByIdAndDelete(id);
}

// ─────────────────────────────────────────────────────────────────────────
// ADMIN WRITE — Hierarchy Office CRUD
// ─────────────────────────────────────────────────────────────────────────

async function listHierarchyOffices(params = {}) {
  const { jurisdictionLevel, jurisdiction, designation, page = 1, limit = 100 } = params;
  const filter = {};
  if (jurisdictionLevel) filter.jurisdictionLevel = jurisdictionLevel;
  if (jurisdiction) filter.jurisdiction = { $regex: String(jurisdiction), $options: "i" };
  if (designation) filter.designation = { $regex: String(designation), $options: "i" };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    PoliceHierarchyOffice.find(filter).sort({ displayOrder: 1, designation: 1 }).skip(skip).limit(limitNum).lean(),
    PoliceHierarchyOffice.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    },
  };
}

async function createHierarchyOffice(data) {
  const office = new PoliceHierarchyOffice(data);
  return office.save();
}

async function updateHierarchyOffice(id, updates) {
  return PoliceHierarchyOffice.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true },
  );
}

async function deleteHierarchyOffice(id) {
  return PoliceHierarchyOffice.findByIdAndDelete(id);
}

// ─────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────

function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  // Public read
  listStations,
  getStationById,
  getDistricts,
  getSubdivisions,
  getTypes,
  searchStations,

  // Admin write
  createStation,
  updateStation,
  archiveStation,
  deleteStation,

  // Hierarchy offices
  listHierarchyOffices,
  createHierarchyOffice,
  updateHierarchyOffice,
  deleteHierarchyOffice,
};
