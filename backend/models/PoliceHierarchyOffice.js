const mongoose = require("mongoose");

const { Schema } = mongoose;

/**
 * PoliceHierarchyOffice Schema — District / Sub-Division-level Police Officers
 *
 * === WHY THIS IS SEPARATE FROM PoliceStation ===
 * Officers like DCP, ACP/OPS, ACP/DIU, ACP/PG Cell, ACP/CAW Cell, ACP/MACT,
 * SJPU, and ACP/Sub-Division are NOT attached to individual police stations.
 * They operate at the district or subdivision level and serve multiple PS.
 * Storing them once per jurisdiction (rather than duplicating into 179 PS
 * records) avoids false/invented assignments and keeps data integrity.
 *
 * The PoliceStation details page fetches the station first, then queries this
 * collection by the station's district / subdivision to display the correct
 * hierarchy-level officers.
 *
 * === FIELD GROUPS ===
 * 1. Hierarchy  — jurisdictionLevel ("district"|"subdivision"), jurisdiction (name), designation
 * 2. Officer    — name, rank, phone, email, address
 * 3. Metadata   — source, lastVerified, sourceUrl
 * 4. Admin      — status, isActive, displayOrder
 */

const policeHierarchyOfficeSchema = new Schema(
  {
    // ── Hierarchy ─────────────────────────────────────────────────────────
    jurisdictionLevel: {
      type: String,
      enum: ["district", "subdivision"],
      required: true,
      index: true,
    },

    jurisdiction: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },

    designation: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },

    // ── Officer ───────────────────────────────────────────────────────────
    name: { type: String, trim: true, default: null },
    rank: { type: String, trim: true, default: null },
    phone: { type: String, trim: true, default: null },
    email: { type: String, trim: true, default: null },
    address: { type: String, trim: true, default: null },

    // ── Metadata ──────────────────────────────────────────────────────────
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

    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// ── Indexes ──────────────────────────────────────────────────────────────

// Lookup all offices for a given jurisdiction level + name
policeHierarchyOfficeSchema.index({
  jurisdictionLevel: 1,
  jurisdiction: 1,
  displayOrder: 1,
});

// Text search
policeHierarchyOfficeSchema.index(
  {
    designation: "text",
    name: "text",
    jurisdiction: "text",
  },
);

module.exports = mongoose.model(
  "PoliceHierarchyOffice",
  policeHierarchyOfficeSchema,
);
