const Tribunal = require("../models/Tribunal");

// GET all tribunals
// Supports an optional `limit` query param (1..500). When omitted the
// response is unchanged (full collection) for backward compatibility with
// existing clients that fetch the whole list and filter client-side.
const MAX_TRIBUNAL_LIMIT = 500;

const getTribunals = async (req, res) => {
  try {
    const query = {};
    const rawLimit = req.query?.limit;
    if (rawLimit !== undefined && String(rawLimit).trim() !== "") {
      const parsed = Number.parseInt(rawLimit, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        return res.status(400).json({
          success: false,
          message: "limit must be a positive integer",
        });
      }
      query.limit = Math.min(parsed, MAX_TRIBUNAL_LIMIT);
    }

    const tribunals = await Tribunal.find({}).limit(query.limit || 0);
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
      // ── Existing fields ──────────────────────────────────────────────────
      name,
      abbreviation,
      category,
      jurisdiction,
      description,
      location,
      website,

      // ── Classification ────────────────────────────────────────────────────
      subCategory,
      tribunalType,
      jurisdictionLevel,
      state,
      district,
      benchType,

      // ── Bench Info ────────────────────────────────────────────────────────
      benchName,
      benchCode,
      principalBench,
      circuitBench,

      // ── Contact ───────────────────────────────────────────────────────────
      address,
      city,
      pincode,
      email,
      phone,
      fax,
      googleMapsLink,

      // ── Working Info ─────────────────────────────────────────────────────
      workingDays,
      workingHours,
      filingMode,
      eFilingAvailable,
      videoConferenceAvailable,

      // ── Resources ────────────────────────────────────────────────────────
      causeListLink,
      ordersLink,
      judgmentsLink,
      notificationsLink,
      circularsLink,
      formsLink,
      rulesLink,
      governingAct,
      governingActLink,

      // ── Administrative ───────────────────────────────────────────────────
      displayOrder,
      isFeatured,
      isActive,
      lastVerifiedAt,
      verifiedBy,

      // ── Verification Metadata (Phase 4) ─────────────────────────────────
      sourceId,
      sourceName,
      sourceUrl,
      sourceType,
      verificationStatus,
      dataSource,
      lastSyncedAt,
      dataVersion,
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

      subCategory,
      tribunalType,
      jurisdictionLevel,
      state,
      district,
      benchType,

      benchName,
      benchCode,
      principalBench,
      circuitBench,

      address,
      city,
      pincode,
      email,
      phone,
      fax,
      googleMapsLink,

      workingDays,
      workingHours,
      filingMode,
      eFilingAvailable,
      videoConferenceAvailable,

      causeListLink,
      ordersLink,
      judgmentsLink,
      notificationsLink,
      circularsLink,
      formsLink,
      rulesLink,
      governingAct,
      governingActLink,

      displayOrder,
      isFeatured,
      isActive,
      lastVerifiedAt,
      verifiedBy,

      sourceId,
      sourceName,
      sourceUrl,
      sourceType,
      verificationStatus,
      dataSource,
      lastSyncedAt,
      dataVersion,
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
      // ── Existing fields ──────────────────────────────────────────────────
      name,
      abbreviation,
      category,
      jurisdiction,
      description,
      location,
      website,

      // ── Classification ────────────────────────────────────────────────────
      subCategory,
      tribunalType,
      jurisdictionLevel,
      state,
      district,
      benchType,

      // ── Bench Info ────────────────────────────────────────────────────────
      benchName,
      benchCode,
      principalBench,
      circuitBench,

      // ── Contact ───────────────────────────────────────────────────────────
      address,
      city,
      pincode,
      email,
      phone,
      fax,
      googleMapsLink,

      // ── Working Info ─────────────────────────────────────────────────────
      workingDays,
      workingHours,
      filingMode,
      eFilingAvailable,
      videoConferenceAvailable,

      // ── Resources ────────────────────────────────────────────────────────
      causeListLink,
      ordersLink,
      judgmentsLink,
      notificationsLink,
      circularsLink,
      formsLink,
      rulesLink,
      governingAct,
      governingActLink,

      // ── Administrative ───────────────────────────────────────────────────
      displayOrder,
      isFeatured,
      isActive,
      lastVerifiedAt,
      verifiedBy,

      // ── Verification Metadata (Phase 4) ─────────────────────────────────
      sourceId,
      sourceName,
      sourceUrl,
      sourceType,
      verificationStatus,
      dataSource,
      lastSyncedAt,
      dataVersion,
    } = req.body;

    const tribunal = await Tribunal.findByIdAndUpdate(
      id,
      {
        // ── Existing fields ──────────────────────────────────────────────────
        ...(name !== undefined ? { name } : {}),
        ...(abbreviation !== undefined ? { abbreviation } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(jurisdiction !== undefined ? { jurisdiction } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(website !== undefined ? { website } : {}),

        // ── Classification ────────────────────────────────────────────────────
        ...(subCategory !== undefined ? { subCategory } : {}),
        ...(tribunalType !== undefined ? { tribunalType } : {}),
        ...(jurisdictionLevel !== undefined ? { jurisdictionLevel } : {}),
        ...(state !== undefined ? { state } : {}),
        ...(district !== undefined ? { district } : {}),
        ...(benchType !== undefined ? { benchType } : {}),

        // ── Bench Info ────────────────────────────────────────────────────────
        ...(benchName !== undefined ? { benchName } : {}),
        ...(benchCode !== undefined ? { benchCode } : {}),
        ...(principalBench !== undefined ? { principalBench } : {}),
        ...(circuitBench !== undefined ? { circuitBench } : {}),

        // ── Contact ───────────────────────────────────────────────────────────
        ...(address !== undefined ? { address } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(pincode !== undefined ? { pincode } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(fax !== undefined ? { fax } : {}),
        ...(googleMapsLink !== undefined ? { googleMapsLink } : {}),

        // ── Working Info ─────────────────────────────────────────────────────
        ...(workingDays !== undefined ? { workingDays } : {}),
        ...(workingHours !== undefined ? { workingHours } : {}),
        ...(filingMode !== undefined ? { filingMode } : {}),
        ...(eFilingAvailable !== undefined ? { eFilingAvailable } : {}),
        ...(videoConferenceAvailable !== undefined ? { videoConferenceAvailable } : {}),

        // ── Resources ────────────────────────────────────────────────────────
        ...(causeListLink !== undefined ? { causeListLink } : {}),
        ...(ordersLink !== undefined ? { ordersLink } : {}),
        ...(judgmentsLink !== undefined ? { judgmentsLink } : {}),
        ...(notificationsLink !== undefined ? { notificationsLink } : {}),
        ...(circularsLink !== undefined ? { circularsLink } : {}),
        ...(formsLink !== undefined ? { formsLink } : {}),
        ...(rulesLink !== undefined ? { rulesLink } : {}),
        ...(governingAct !== undefined ? { governingAct } : {}),
        ...(governingActLink !== undefined ? { governingActLink } : {}),

        // ── Administrative ───────────────────────────────────────────────────
        ...(displayOrder !== undefined ? { displayOrder } : {}),
        ...(isFeatured !== undefined ? { isFeatured } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(lastVerifiedAt !== undefined ? { lastVerifiedAt } : {}),
        ...(verifiedBy !== undefined ? { verifiedBy } : {}),

        // ── Verification Metadata (Phase 4) ─────────────────────────────────
        ...(sourceId !== undefined ? { sourceId } : {}),
        ...(sourceName !== undefined ? { sourceName } : {}),
        ...(sourceUrl !== undefined ? { sourceUrl } : {}),
        ...(sourceType !== undefined ? { sourceType } : {}),
        ...(verificationStatus !== undefined ? { verificationStatus } : {}),
        ...(dataSource !== undefined ? { dataSource } : {}),
        ...(lastSyncedAt !== undefined ? { lastSyncedAt } : {}),
        ...(dataVersion !== undefined ? { dataVersion } : {}),
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
