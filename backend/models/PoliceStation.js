const mongoose = require("mongoose");

const { Schema } = mongoose;

/**
 * PoliceStation Schema — Delhi Police Territorial Police Station Directory
 *
 * === DESIGN PRINCIPLES ===
 * - Stores station-level data for each of the 179 territorial police stations in Delhi.
 * - District/subdivision-level officers (DCP, ACP/OPS, ACP/DIU, etc.) are NOT
 *   embedded here to avoid duplicating false information across 179 records.
 *   They live in the PoliceHierarchyOffice collection, linked by district/subdivision.
 * - SHO (Station House Officer) IS embedded as they are specific to each PS.
 * - All non-verified fields default to null — never fabricate.
 * - Every record carries source + lastVerified for data provenance.
 *
 * === FIELD GROUPS ===
 * 1. Identity   — name, district, subdivision, type, source, lastVerified
 * 2. Contact     — address, pinCode, phone, email
 * 3. Officer     — sho (Station House Officer)
 * 4. Location    — location { latitude, longitude }
 * 5. Admin       — status, isActive, displayOrder, isFeatured
 */

const officerSubSchema = new Schema(
  {
    name: { type: String, trim: true, default: null },
    rank: { type: String, trim: true, default: null },
    phone: { type: String, trim: true, default: null },
    email: { type: String, trim: true, default: null },
    address: { type: String, trim: true, default: null },
  },
  { _id: false },
);

const locationSubSchema = new Schema(
  {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  { _id: false },
);

const policeStationSchema = new Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },

    district: { type: String, trim: true, default: "", index: true },
    subdivision: { type: String, trim: true, default: "", index: true },

    type: { type: String, trim: true, default: "Police Station" },

    // ── Contact ───────────────────────────────────────────────────────────
    address: { type: String, trim: true, default: null },
    pinCode: { type: String, trim: true, default: null },
    phone: { type: String, trim: true, default: null },
    email: { type: String, trim: true, default: null },

    // ── Station House Officer (PS-level) ──────────────────────────────────
    sho: officerSubSchema,

    // ── Location ──────────────────────────────────────────────────────────
    location: locationSubSchema,

    // ── Data Source / Verification ────────────────────────────────────────
    source: { type: String, trim: true, default: "Delhi Police" },
    lastVerified: { type: Date, default: null },

    sourceUrl: { type: String, trim: true, default: null },

    // ── Admin ─────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// ── Indexes ──────────────────────────────────────────────────────────────

// Fast lookup by name (exact or case-insensitive)
policeStationSchema.index({ name: 1 });

// Composite index for district + subdivision filtering
policeStationSchema.index({ district: 1, subdivision: 1, name: 1 });

// Text search across key fields
policeStationSchema.index(
  {
    name: "text",
    district: "text",
    subdivision: "text",
    address: "text",
    phone: "text",
    "sho.name": "text",
  },
);

// Active + published stations only for public queries
policeStationSchema.index({ status: 1, isActive: 1 });

module.exports = mongoose.model("PoliceStation", policeStationSchema);
