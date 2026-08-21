const router = require("express").Router();
const judgeDirectoryController = require("../controllers/judgeDirectoryController");

// Public endpoints — no auth required
// GET /api/judge-directory/:courtId — Get published judges for a court
router.get("/:courtId", judgeDirectoryController.getJudgesByCourt);

// GET /api/judge-directory/detail/:id — Get a single published judge by ID
router.get("/detail/:id", judgeDirectoryController.getJudgeById);

module.exports = router;

