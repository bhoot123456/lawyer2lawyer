const DistrictCourtJudge = require("../models/DistrictCourtJudge");

// ─────────────────────────────────────────────────────────
// Mapping: complexId → human-readable name
// ─────────────────────────────────────────────────────────

const COMPLEX_NAMES = {
  rohini: "Rohini Court Complex",
  "tis-hazari": "Tis Hazari Court Complex",
  saket: "Saket Court Complex",
  karkardooma: "Karkardooma Court Complex",
  "patiala-house": "Patiala House Court Complex",
  dwarka: "Dwarka Court Complex",
  "rouse-avenue": "Rouse Avenue Court Complex",
};

// ─────────────────────────────────────────────────────────
// Mapping: (complexId, districtId) → human-readable district name
// ─────────────────────────────────────────────────────────

const DISTRICT_NAMES = {
  rohini: {
    north: "North District",
    "north-west": "North-West District",
  },
  "tis-hazari": {
    central: "Central District",
    "civil-original": "Civil (Original) Jurisdiction",
  },
  saket: {
    south: "South District",
    "south-east": "South-East District",
  },
  karkardooma: {
    east: "East District",
    shahdara: "Shahdara District",
    "north-east": "North-East District",
  },
  "patiala-house": {
    "patiala-house-sessions": "Patiala House Sessions Division",
  },
  dwarka: {
    "south-west": "South-West District",
  },
  "rouse-avenue": {
    "rouse-avenue-sessions": "Rouse Avenue Sessions Division",
  },
};

/**
 * Maps a single judge document to the API response shape.
 * Preserves original DB fields while mapping to the required contract:
 *   judgeName → name
 *   meetingId → vcMeetingId
 */
function mapJudge(doc) {
  return {
    _id: doc._id,
    name: doc.judgeName,
    designation: doc.designation || "",
    jurisdiction: doc.jurisdiction || "",
    courtRoom: doc.courtRoom,
    vcLink: doc.vcLink || "",
    vcMeetingId: doc.meetingId || "",
    email: doc.email || "",
    isActive: doc.isActive !== undefined ? doc.isActive : true,
  };
}

/**
 * GET /api/district-courts/:complexId/:districtId/judges
 *
 * Returns all published judges for a given court complex and district,
 * sorted by displayOrder ascending.
 *
 * Response shape:
 * {
 *   success: true,
 *   complex: "Rohini Court Complex",
 *   district: "North District",
 *   total: 45,
 *   judges: [{ _id, name, designation, courtRoom, vcLink, vcMeetingId, email }]
 * }
 */
exports.getJudgesByDistrict = async (req, res) => {
  try {
    const { complexId, districtId } = req.params;

    if (!complexId || !districtId) {
      return res.status(400).json({
        success: false,
        message: "complexId and districtId are required",
      });
    }

    const normalizedComplexId = complexId.toLowerCase().trim();
    const normalizedDistrictId = districtId.toLowerCase().trim();

    const filter = {
      complexId: normalizedComplexId,
      districtId: normalizedDistrictId,
      status: "published",
    };

    const docs = await DistrictCourtJudge.find(filter)
      .sort({ displayOrder: 1 })
      .select(
        "complexId districtId judgeName designation jurisdiction courtRoom vcLink meetingId email displayOrder isActive",
      );

    const judges = docs.map(mapJudge);

    const complexName =
      COMPLEX_NAMES[normalizedComplexId] ||
      normalizedComplexId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const districtMap = DISTRICT_NAMES[normalizedComplexId];
    const districtName =
      (districtMap && districtMap[normalizedDistrictId]) ||
      normalizedDistrictId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    res.json({
      success: true,
      complex: complexName,
      district: districtName,
      total: judges.length,
      judges,
    });
  } catch (error) {
    console.error("getJudgesByDistrict error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch district court judges",
    });
  }
};

/**
 * GET /api/district-courts/:complexId/:districtId/judges-on-leave
 *
 * Returns all published judges for a given court complex and district
 * who are currently marked as on leave (isOnLeave === true),
 * sorted by displayOrder ascending.
 *
 * Response shape:
 * {
 *   success: true,
 *   complex: "Rohini Court Complex",
 *   district: "North District",
 *   total: 2,
 *   judges: [{ _id, name, designation, courtRoom, vcLink, vcMeetingId, email, leaveFrom, leaveTo, leaveReason }]
 * }
 */
exports.getJudgesOnLeave = async (req, res) => {
  try {
    const { complexId, districtId } = req.params;

    if (!complexId || !districtId) {
      return res.status(400).json({
        success: false,
        message: "complexId and districtId are required",
      });
    }

    const normalizedComplexId = complexId.toLowerCase().trim();
    const normalizedDistrictId = districtId.toLowerCase().trim();

    const filter = {
      complexId: normalizedComplexId,
      districtId: normalizedDistrictId,
      status: "published",
      isOnLeave: true,
    };

    const docs = await DistrictCourtJudge.find(filter)
      .sort({ displayOrder: 1 })
      .select(
        "complexId districtId judgeName designation jurisdiction courtRoom vcLink meetingId email displayOrder isActive leaveFrom leaveTo leaveReason",
      );

    const judges = docs.map((doc) => ({
      _id: doc._id,
      name: doc.judgeName,
      designation: doc.designation || "",
      jurisdiction: doc.jurisdiction || "",
      courtRoom: doc.courtRoom,
      vcLink: doc.vcLink || "",
      vcMeetingId: doc.meetingId || "",
      email: doc.email || "",
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      leaveFrom: doc.leaveFrom || null,
      leaveTo: doc.leaveTo || null,
      leaveReason: doc.leaveReason || "",
    }));

    const complexName =
      COMPLEX_NAMES[normalizedComplexId] ||
      normalizedComplexId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const districtMap = DISTRICT_NAMES[normalizedComplexId];
    const districtName =
      (districtMap && districtMap[normalizedDistrictId]) ||
      normalizedDistrictId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    res.json({
      success: true,
      complex: complexName,
      district: districtName,
      total: judges.length,
      judges,
    });
  } catch (error) {
    console.error("getJudgesOnLeave error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch judges on leave",
    });
  }
};

/**
 * GET /api/district-courts/:complexId/:districtId/judges/:id
 *
 * Returns a single published judge by ID.
 */
exports.getJudgeById = async (req, res) => {
  try {
    const judge = await DistrictCourtJudge.findById(req.params.id);

    if (!judge) {
      return res.status(404).json({
        success: false,
        message: "Judge not found",
      });
    }

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

