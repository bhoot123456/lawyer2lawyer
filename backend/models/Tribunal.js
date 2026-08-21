const mongoose = require("mongoose");

/**
 * Tribunal Schema — Phase 1 Extended + Phase 4 Metadata
 *
 * === DESIGN PRINCIPLES ===
 * - Every existing field is preserved exactly as-is (name, abbreviation, category,
 *   jurisdiction, description, location, website).
 * - All new fields are optional with safe defaults — never break existing documents.
 * - No migration required. Existing MongoDB documents remain valid.
 * - Backward compatible with all existing controllers, routes, and frontend code.
 *
 * === FIELD GROUPS ===
 * 1. Classification  — category, subCategory, tribunalType, jurisdictionLevel, state, district, benchType
 * 2. Bench Info      — benchName, benchCode, principalBench, circuitBench
 * 3. Contact         — address, city, pincode, email, phone, fax, googleMapsLink
 * 4. Working Info    — workingDays, workingHours, filingMode, eFilingAvailable, videoConferenceAvailable
 * 5. Resources       — website (existing), causeListLink, ordersLink, judgmentsLink, notificationsLink,
 *                      circularsLink, formsLink, rulesLink, governingAct, governingActLink
 * 6. Administrative  — displayOrder, isFeatured, isActive, lastVerifiedAt, verifiedBy
 * 7. Verification    — sourceId, sourceName, sourceUrl, sourceType, verificationStatus, dataSource,
 *                      lastSyncedAt, dataVersion
 */
const tribunalSchema = new mongoose.Schema(
  {
    // ── Existing Fields (preserved exactly as-is) ──────────────────────────
    name:         { type: String, required: true, trim: true },
    abbreviation: { type: String, trim: true },
    category:     { type: String, trim: true },
    jurisdiction: { type: String, trim: true },
    description:  { type: String },
    location:     { type: String, trim: true },
    website:      { type: String, trim: true },

    // ── Classification Fields (optional) ───────────────────────────────────
    subCategory:        { type: String, trim: true, default: "" },
    tribunalType:       { type: String, trim: true, default: "" },
    jurisdictionLevel:  { type: String, trim: true, default: "" },
    state:              { type: String, trim: true, default: "" },
    district:           { type: String, trim: true, default: "" },
    benchType:          { type: String, trim: true, default: "" },

    // ── Bench Information (optional) ───────────────────────────────────────
    benchName:      { type: String, trim: true, default: "" },
    benchCode:      { type: String, trim: true, default: "" },
    principalBench: { type: Boolean, default: false },
    circuitBench:   { type: Boolean, default: false },

    // ── Contact Information (optional) ─────────────────────────────────────
    address:        { type: String, trim: true, default: "" },
    city:           { type: String, trim: true, default: "" },
    pincode:        { type: String, trim: true, default: "" },
    email:          { type: String, trim: true, default: "" },
    phone:          { type: String, trim: true, default: "" },
    fax:            { type: String, trim: true, default: "" },
    googleMapsLink: { type: String, trim: true, default: "" },

    // ── Working Information (optional) ─────────────────────────────────────
    workingDays:               { type: String, trim: true, default: "" },
    workingHours:              { type: String, trim: true, default: "" },
    filingMode:                { type: String, trim: true, default: "" },
    eFilingAvailable:          { type: Boolean, default: false },
    videoConferenceAvailable:  { type: Boolean, default: false },

    // ── Official Resources (optional) ──────────────────────────────────────
    causeListLink:      { type: String, trim: true, default: "" },
    ordersLink:         { type: String, trim: true, default: "" },
    judgmentsLink:      { type: String, trim: true, default: "" },
    notificationsLink:  { type: String, trim: true, default: "" },
    circularsLink:      { type: String, trim: true, default: "" },
    formsLink:          { type: String, trim: true, default: "" },
    rulesLink:          { type: String, trim: true, default: "" },
    governingAct:       { type: String, trim: true, default: "" },
    governingActLink:   { type: String, trim: true, default: "" },

    // ── Administrative Fields (optional) ───────────────────────────────────
    displayOrder:   { type: Number, default: 0 },
    isFeatured:     { type: Boolean, default: false },
    isActive:       { type: Boolean, default: true },
    lastVerifiedAt: { type: Date },
    verifiedBy:     { type: String, trim: true, default: "" },

    // ── Phase 4: Verification / Data Source Metadata (optional) ───────────
    // sourceId: stable external identifier used for idempotent upserts.
    // verificationStatus: "verified" | "unverified" | "draft"
    sourceId:           { type: String, trim: true, default: "" },
    sourceName:         { type: String, trim: true, default: "" },
    sourceUrl:          { type: String, trim: true, default: "" },
    sourceType:         { type: String, trim: true, default: "" },
    verificationStatus: { type: String, trim: true, default: "unverified" },
    dataSource:         { type: String, trim: true, default: "" },
    lastSyncedAt:       { type: Date },
    dataVersion:        { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Tribunal", tribunalSchema);
