const router = require("express").Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { checkPermission } = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");
const adminCrud = require("../controllers/adminCrudController");
const User = require("../models/User");
const Case = require("../models/Case");

// All admin routes require authentication + admin role
router.use(auth, adminAuth);


// ============================
// DASHBOARD
// ============================
router.get("/dashboard", adminController.getDashboardStats);
router.get("/revenue-stats", adminController.getRevenueStats);

// ============================
// LAWYERS MANAGEMENT
// ============================
router.get(
  "/lawyers",
  checkPermission("manageLawyers"),
  adminController.getAllLawyers,
);
router.get(
  "/lawyers/:id",
  checkPermission("manageLawyers"),
  adminController.getLawyerById,
);
router.put(
  "/lawyers/:id",
  checkPermission("manageLawyers"),
  adminController.updateLawyer,
);
router.patch(
  "/lawyers/:id/verify",
  checkPermission("manageLawyers"),
  adminController.verifyLawyer,
);
router.delete(
  "/lawyers/:id",
  checkPermission("manageLawyers"),
  adminController.deleteLawyer,
);

// ============================
// CLIENTS MANAGEMENT
// ============================
router.get(
  "/clients",
  checkPermission("manageClients"),
  adminController.getAllClients,
);
router.get(
  "/clients/:id",
  checkPermission("manageClients"),
  adminController.getClientById,
);
router.put(
  "/clients/:id",
  checkPermission("manageClients"),
  adminController.updateClient,
);
router.delete(
  "/clients/:id",
  checkPermission("manageClients"),
  adminController.deleteClient,
);

// ============================
// CASES MANAGEMENT
// ============================
router.get(
  "/cases",
  checkPermission("manageCases"),
  adminController.getAllCasesAdmin,
);
router.get(
  "/cases/:id",
  checkPermission("manageCases"),
  adminController.getCaseByIdAdmin,
);
router.put(
  "/cases/:id",
  checkPermission("manageCases"),
  adminController.updateCaseAdmin,
);
router.patch(
  "/cases/:id/archive",
  checkPermission("manageCases"),
  adminController.archiveCase,
);
router.delete(
  "/cases/:id",
  checkPermission("manageCases"),
  adminController.deleteCaseAdmin,
);

// ============================
// BARE ACTS MANAGEMENT
// ============================
router.get(
  "/bare-acts",
  checkPermission("manageBareActs"),
  adminCrud.listBareActsAdmin,
);
router.get(
  "/bare-acts/:id",
  checkPermission("manageBareActs"),
  adminCrud.getBareActAdmin,
);
router.post(
  "/bare-acts",
  checkPermission("manageBareActs"),
  adminCrud.createBareActAdmin,
);
router.put(
  "/bare-acts/:id",
  checkPermission("manageBareActs"),
  adminCrud.updateBareActAdmin,
);
router.delete(
  "/bare-acts/:id",
  checkPermission("manageBareActs"),
  adminCrud.deleteBareActAdmin,
);

// ============================
// REVENUE COURT PHASE 8 MANAGEMENT
// ============================
router.get(
  "/revenue-court-phase8",
  checkPermission("manageRevenue"),
  adminCrud.listRevenueCourtPhase8Admin,
);
router.get(
  "/revenue-court-phase8/:id",
  checkPermission("manageRevenue"),
  adminCrud.getRevenueCourtPhase8Admin,
);
router.post(
  "/revenue-court-phase8",
  checkPermission("manageRevenue"),
  adminCrud.createRevenueCourtPhase8Admin,
);
router.put(
  "/revenue-court-phase8/:id",
  checkPermission("manageRevenue"),
  adminCrud.updateRevenueCourtPhase8Admin,
);
router.delete(
  "/revenue-court-phase8/:id",
  checkPermission("manageRevenue"),
  adminCrud.deleteRevenueCourtPhase8Admin,
);

// ============================
// TAX & CORPORATE PHASE 9 MANAGEMENT
// ============================
router.get(
  "/tax-corporate-phase9",
  checkPermission("manageTax"),
  adminCrud.listTaxCorporatePhase9Admin,
);
router.get(
  "/tax-corporate-phase9/:id",
  checkPermission("manageTax"),
  adminCrud.getTaxCorporatePhase9Admin,
);
router.post(
  "/tax-corporate-phase9",
  checkPermission("manageTax"),
  adminCrud.createTaxCorporatePhase9Admin,
);
router.put(
  "/tax-corporate-phase9/:id",
  checkPermission("manageTax"),
  adminCrud.updateTaxCorporatePhase9Admin,
);
router.delete(
  "/tax-corporate-phase9/:id",
  checkPermission("manageTax"),
  adminCrud.deleteTaxCorporatePhase9Admin,
);

// ============================
// REPORTS MANAGEMENT
// ============================
router.get(
  "/reports",
  checkPermission("manageReports"),
  adminCrud.listReportsAdmin,
);
router.get(
  "/reports/:id",
  checkPermission("manageReports"),
  adminCrud.getReportAdmin,
);
router.post(
  "/reports",
  checkPermission("manageReports"),
  adminCrud.createReportAdmin,
);
router.put(
  "/reports/:id",
  checkPermission("manageReports"),
  adminCrud.updateReportAdmin,
);
router.delete(
  "/reports/:id",
  checkPermission("manageReports"),
  adminCrud.deleteReportAdmin,
);

router.get(
  "/articles",
  checkPermission("manageArticles"),
  adminController.getAllArticles,
);

router.get(
  "/articles/:id",
  checkPermission("manageArticles"),
  adminController.getArticleById,
);
router.post(
  "/articles",
  checkPermission("manageArticles"),
  adminController.createArticle,
);
router.put(
  "/articles/:id",
  checkPermission("manageArticles"),
  adminController.updateArticle,
);
router.patch(
  "/articles/:id/publish",
  checkPermission("manageArticles"),
  adminController.publishArticle,
);
router.patch(
  "/articles/:id/unpublish",
  checkPermission("manageArticles"),
  adminController.unpublishArticle,
);
router.delete(
  "/articles/:id",
  checkPermission("manageArticles"),
  adminController.deleteArticle,
);

// ============================
// JUDGE DIRECTORY MANAGEMENT
// ============================
router.get(
  "/judge-directory",
  checkPermission("manageJudgeDirectory"),
  adminCrud.listJudgeDirectoryAdmin,
);
router.get(
  "/judge-directory/:id",
  checkPermission("manageJudgeDirectory"),
  adminCrud.getJudgeDirectoryAdmin,
);
router.post(
  "/judge-directory",
  checkPermission("manageJudgeDirectory"),
  adminCrud.createJudgeDirectoryAdmin,
);
router.put(
  "/judge-directory/:id",
  checkPermission("manageJudgeDirectory"),
  adminCrud.updateJudgeDirectoryAdmin,
);
router.delete(
  "/judge-directory/:id",
  checkPermission("manageJudgeDirectory"),
  adminCrud.deleteJudgeDirectoryAdmin,
);

// ============================
// POLICE STATIONS MANAGEMENT
// ============================
// Public-read controller handles public list/detail; admin routes
// provide full CRUD via the same controller methods.
const policeStationController = require("../controllers/policeStationController");

router.get(
  "/police-stations",
  checkPermission("managePoliceStations"),
  policeStationController.listStationsAdmin,
);
router.get(
  "/police-stations/:id",
  checkPermission("managePoliceStations"),
  policeStationController.getStationAdmin,
);
router.post(
  "/police-stations",
  checkPermission("managePoliceStations"),
  policeStationController.createStationAdmin,
);
router.put(
  "/police-stations/:id",
  checkPermission("managePoliceStations"),
  policeStationController.updateStationAdmin,
);
router.delete(
  "/police-stations/:id",
  checkPermission("managePoliceStations"),
  policeStationController.deleteStationAdmin,
);

// ============================
// POLICE HIERARCHY OFFICES MANAGEMENT
// ============================
router.get(
  "/police-hierarchy",
  checkPermission("managePoliceStations"),
  policeStationController.listHierarchyOfficesAdmin,
);
router.post(
  "/police-hierarchy",
  checkPermission("managePoliceStations"),
  policeStationController.createHierarchyOfficeAdmin,
);
router.put(
  "/police-hierarchy/:id",
  checkPermission("managePoliceStations"),
  policeStationController.updateHierarchyOfficeAdmin,
);
router.delete(
  "/police-hierarchy/:id",
  checkPermission("managePoliceStations"),
  policeStationController.deleteHierarchyOfficeAdmin,
);

// ============================
// GET ALL USERS FOR ADMIN (reusable)
// ============================
router.get("/users", async (req, res) => {
  try {
    const { role, page = 1, limit = 50, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password"),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

module.exports = router;