const router = require("express").Router();
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const deviceAuth = require("../middleware/deviceAuth");
const aiRateLimit = require("../middleware/rateLimit");
const caseController = require("../controllers/caseController");

// Case Management APIs
// Base path: /api/cases

router.post("/", [optionalAuth, deviceAuth, aiRateLimit], caseController.createCase);

router.get("/", [optionalAuth, deviceAuth], caseController.getAllCases);

router.get("/:id", [optionalAuth, deviceAuth], caseController.getSingleCase);

router.put("/:id", [optionalAuth, deviceAuth], caseController.updateCase);

router.delete("/:id", [optionalAuth, deviceAuth], caseController.deleteCase);

// Timeline
router.post("/:id/timeline", auth, caseController.addTimelineEntry);

// Notes
router.post("/:id/notes", auth, caseController.addNote);

// Documents
router.post("/:id/documents", auth, caseController.addDocument);

// Expenses
router.put("/:id/expenses", auth, caseController.updateExpenses);

module.exports = router;

