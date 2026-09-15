const router = require("express").Router();
const lawyerAuth = require("../middleware/lawyerAuth");
const caseService = require("../services/caseService");
const authService = require("../services/authService");

// CourtDesk — lawyer-private surface.
//
// Security model (Phase 1 — "Authenticated Lawyer Foundation"):
//  * Every route below is protected by `lawyerAuth` ONLY. `deviceAuth` is
//    deliberately NOT mounted here, so there is no `req.deviceId`. The
//    lawyer's JWT is therefore the canonical, sole identity — a
//    `X-Device-Id` header (which the mobile interceptor always attaches)
//    is explicitly ignored on this surface. This guarantees identity
//    precedence: JWT > device, for a lawyer's own private data.
//
//  * Case list / case view reuse caseService.getAllCases / getCaseById.
//    Because no `deviceId` is passed, those helpers route through the
//    JWT path and scope the results to the lawyer's `assignedTo` field
//    (see buildCaseQueryFilters + getCaseById view logic). A lawyer can
//    therefore ONLY ever see cases assigned to them.

// ── Lawyer profile (private) ──────────────────────────────────────────────
router.get("/profile", lawyerAuth, (req, res) => {
  // req.user is the JWT-authenticated lawyer (passwords stripped).
  res.json({
    success: true,
    user: authService.safeUserForClient(req.user),
  });
});

// ── Lawyer's private case list ────────────────────────────────────────────
router.get("/cases", lawyerAuth, async (req, res) => {
  try {
    // NOTE: deviceId intentionally omitted -> lawyer JWT scoping applies.
    const result = await caseService.getAllCases({
      query: req.query,
      user: req.user,
    });

    if (!result.ok) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.json({
      success: true,
      cases: result.cases,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json({ success: false, message: "Unable to fetch cases" });
  }
});

// ── Single case, scoped to the lawyer (assignedTo) ────────────────────────
router.get("/cases/:id", lawyerAuth, async (req, res) => {
  try {
    // NOTE: deviceId intentionally omitted -> lawyer JWT scoping applies.
    const result = await caseService.getCaseById({
      id: req.params.id,
      user: req.user,
    });

    if (!result.ok) {
      if (result.code === 403) {
        // Do NOT leak whether the case exists — return 404 to an
        // unauthorized lawyer (prevents case-enumeration by ID).
        return res.status(404).json({ success: false, message: "Case not found" });
      }
      return res.status(result.code || 400).json({ success: false, message: result.message });
    }

    return res.json({ success: true, case: result.case });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json({ success: false, message: "Unable to fetch case" });
  }
});

module.exports = router;
