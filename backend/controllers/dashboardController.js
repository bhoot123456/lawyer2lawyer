const CourtHoliday = require("../models/CourtHoliday");
const DailyCauseListEntry = require("../models/DailyCauseListEntry");
const Notification = require("../models/Notification");
const Case = require("../models/Case");
const DraftTemplate = require("../models/DraftTemplate");

/**
 * GET /api/client-calls
 * No model exists for client calls; return empty array.
 */
exports.getClientCalls = async (req, res) => {
  try {
    return res.json({ calls: [] });
  } catch (err) {
    console.error("getClientCalls error:", err);
    return res.status(500).json({ calls: [] });
  }
};

/**
 * GET /api/court-holidays
 * Uses existing CourtHoliday model if available.
 */
exports.getCourtHolidays = async (req, res) => {
  try {
    let holidays = [];
    try {
      holidays = await CourtHoliday.find({
        status: "active",
        holidayDate: { $gte: new Date() },
      })
        .sort({ holidayDate: 1 })
        .lean();
    } catch {
      // Model or collection may not exist; return empty
    }
    return res.json({ holidays });
  } catch (err) {
    console.error("getCourtHolidays error:", err);
    return res.json({ holidays: [] });
  }
};

/**
 * GET /api/daily-cause-list
 * Uses existing DailyCauseListEntry model if available.
 */
exports.getDailyCauseList = async (req, res) => {
  try {
    let entries = [];
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      entries = await DailyCauseListEntry.find({
        status: "active",
        causeListDate: { $gte: today, $lt: tomorrow },
      })
        .sort({ displayOrder: 1 })
        .lean();
    } catch {
      // Model or collection may not exist; return empty
    }
    return res.json({ entries });
  } catch (err) {
    console.error("getDailyCauseList error:", err);
    return res.json({ entries: [] });
  }
};

/**
 * GET /api/legal-news
 * No model exists for legal news; return empty array.
 */
exports.getLegalNews = async (req, res) => {
  try {
    return res.json({ news: [] });
  } catch (err) {
    console.error("getLegalNews error:", err);
    return res.status(500).json({ news: [] });
  }
};

/**
 * GET /api/activity/recent
 * Uses existing Notification model if available.
 */
exports.getRecentActivity = async (req, res) => {
  try {
    let activities = [];
    try {
      const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      activities = notifications.map((n) => ({
        id: n._id,
        type: n.category || "system",
        title: n.title,
        description: n.body,
        timestamp: n.createdAt,
        icon: null,
      }));
    } catch {
      // Model or collection may not exist; return empty
    }
    return res.json({ activities });
  } catch (err) {
    console.error("getRecentActivity error:", err);
    return res.json({ activities: [] });
  }
};

/**
 * GET /api/dashboard/stats
 * Uses existing Case and DraftTemplate models if available.
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {
      todayHearings: 0,
      activeCases: 0,
      pendingCases: 0,
      revenueToday: 0,
      clientMeetings: 0,
      pendingDrafts: 0,
    };

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Personal-data endpoint: scope case counts to the requesting user.
      // admin -> all cases (authorized admin path); lawyer -> assigned cases;
      // client and any other role -> own created cases. (Previously EVERY
      // authenticated user received GLOBAL counts — with a stale token the
      // public dashboard displayed another user's case statistics.)
      const scope = {};
      if (req.user?.role === "lawyer") {
        scope.assignedTo = req.user._id;
      } else if (req.user?.role !== "admin") {
        scope.createdBy = req.user._id;
      }

      const [todayHearingsCount, activeCasesCount, pendingCasesCount, pendingDraftsCount] =
        await Promise.all([
          Case.countDocuments({
            ...scope,
            nextHearingDate: { $gte: today, $lt: tomorrow },
          }),
          Case.countDocuments({
            ...scope,
            status: { $nin: ["Disposed", "Closed"] },
          }),
          Case.countDocuments({ ...scope, status: "Pending" }),
          DraftTemplate.countDocuments({ isSaved: true }),
        ]);

      stats.todayHearings = todayHearingsCount;
      stats.activeCases = activeCasesCount;
      stats.pendingCases = pendingCasesCount;
      stats.pendingDrafts = pendingDraftsCount;
    } catch {
      // Models or collections may not exist; return zeros
    }

    return res.json({ stats });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.json({
      stats: {
        todayHearings: 0,
        activeCases: 0,
        pendingCases: 0,
        revenueToday: 0,
        clientMeetings: 0,
        pendingDrafts: 0,
      },
    });
  }
};

