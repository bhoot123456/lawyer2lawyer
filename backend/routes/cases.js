const router = require("express").Router();
const auth = require("../middleware/auth");
const caseController = require("../controllers/caseController");

// Case Management APIs (JWT protected)
// Base path: /api/cases

router.post("/", auth, caseController.createCase);

router.get("/", auth, caseController.getAllCases);

router.get("/:id", auth, caseController.getSingleCase);

router.put("/:id", auth, caseController.updateCase);

router.delete("/:id", auth, caseController.deleteCase);

// Timeline
router.post("/:id/timeline", auth, caseController.addTimelineEntry);

// Notes
router.post("/:id/notes", auth, caseController.addNote);

// Documents
router.post("/:id/documents", auth, caseController.addDocument);

// Expenses
router.put("/:id/expenses", auth, caseController.updateExpenses);

module.exports = router;

