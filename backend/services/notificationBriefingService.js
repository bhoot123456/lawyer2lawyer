/**
 * Notification Briefing Service
 *
 * Why this file is needed:
 * - Generates the daily “morning briefing” payload for the dashboard.
 * - Keeps the business logic out of controllers/routes.
 * - Uses existing Case model fields (nextHearingDate, priority, status) to produce enterprise-ready briefing sections.
 *
 * Where it should be placed:
 * - app/backend/services/notificationBriefingService.js
 *
 * Which existing files need modification:
 * - app/backend/controllers/notificationController.js (next file) will call this service.
 * - app/backend/routes/notifications.js (next file) will expose endpoints.
 * - app/backend/index.js (later) will mount /api/notifications.
 *
 * Complete integration steps (what will happen across files):
 * 1) This service is imported by notificationController.
 * 2) notificationController provides GET /api/notifications/briefing/today.
 * 3) Mobile DashboardScreen consumes the endpoint.
 */

const Case = require("../models/Case");

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function formatCaseForBriefing(c) {
  return {
    id: c._id,
    caseNumber: c.caseNumber,
    caseTitle: c.caseTitle,
    court: c.court,
    nextHearingDate: c.nextHearingDate,
    status: c.status,
    priority: c.priority,
  };
}

/**
 * Build the daily briefing payload.
 * This is an aggregation-first approach for v1 to keep data accurate even without admin-published notification content.
 */
async function buildTodayBriefing({ user }) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const tomorrow = addDays(now, 1);
  const tomorrowStart = startOfDay(tomorrow);
  const tomorrowEnd = endOfDay(tomorrow);

  // Role-based case visibility:
  // - admin: all
  // - lawyer: assignedTo
  // - client: createdBy
  const role = user?.role;

  const baseFilter = {};
  if (role === "lawyer") baseFilter.assignedTo = user._id;
  if (role === "client") baseFilter.createdBy = user._id;

  const todayHearingsQuery = {
    ...baseFilter,
    nextHearingDate: { $gte: todayStart, $lte: todayEnd },
  };

  const tomorrowHearingsQuery = {
    ...baseFilter,
    nextHearingDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
  };

  const urgentCasesQuery = {
    ...baseFilter,
    priority: "Urgent",
    nextHearingDate: { $gte: todayStart, $lte: addDays(todayEnd, 7) },
  };

  // Upcoming deadlines placeholder:
  // For v1 we treat nextHearingDate as the primary deadline signal.
  const upcomingDeadlinesQuery = {
    ...baseFilter,
    nextHearingDate: { $gte: todayStart, $lte: addDays(todayEnd, 14) },
  };

  const [todayHearingsCases, tomorrowHearingsCases, urgentCases, upcomingDeadlinesCases] =
    await Promise.all([
      Case.find(todayHearingsQuery)
        .sort({ nextHearingDate: 1 })
        .limit(10)
        .select("caseTitle caseNumber court nextHearingDate status priority _id")
        .lean(),
      Case.find(tomorrowHearingsQuery)
        .sort({ nextHearingDate: 1 })
        .limit(10)
        .select("caseTitle caseNumber court nextHearingDate status priority _id")
        .lean(),
      Case.find(urgentCasesQuery)
        .sort({ nextHearingDate: 1 })
        .limit(10)
        .select("caseTitle caseNumber court nextHearingDate status priority _id")
        .lean(),
      Case.find(upcomingDeadlinesQuery)
        .sort({ nextHearingDate: 1 })
        .limit(12)
        .select("caseTitle caseNumber court nextHearingDate status priority _id")
        .lean(),
    ]);

  const pendingTasks = todayHearingsCases
    .slice(0, 5)
    .map((c) => ({
      title: `Prepare for hearing • ${c.caseTitle || c.caseNumber}`,
      subtitle: `${c.court || "Court"} • ${new Date(c.nextHearingDate).toLocaleDateString()}`,
    }));

  // Premium dashboard expects weekly/monthly summary sections.
  const weekStart = startOfDay(addDays(now, -((now.getDay() + 6) % 7))); // Monday
  const weekEnd = endOfDay(addDays(weekStart, 6));
  const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const [weekCasesCount, monthCasesCount] = await Promise.all([
    Case.countDocuments({
      ...baseFilter,
      nextHearingDate: { $gte: weekStart, $lte: weekEnd },
    }),
    Case.countDocuments({
      ...baseFilter,
      nextHearingDate: { $gte: monthStart, $lte: monthEnd },
    }),
  ]);

  return {
    greeting: (() => {
      const h = now.getHours();
      if (h < 12) return "Good Morning";
      if (h < 17) return "Good Afternoon";
      return "Good Evening";
    })(),

    today: {
      hearings: todayHearingsCases.map(formatCaseForBriefing),
      pendingTasks,
      upcomingDeadlines: upcomingDeadlinesCases.map(formatCaseForBriefing).slice(0, 6),
      urgentCases: urgentCases.map(formatCaseForBriefing),
    },

    tomorrow: {
      hearings: tomorrowHearingsCases.map(formatCaseForBriefing),
    },

    courtHolidayAlerts: {
      items: [],
      note: "No court holiday data configured yet. Will be populated by admin publishing.",
    },

    importantLegalNotifications: {
      items: [],
      note: "No legal notification feed configured yet. Will be populated by admin publishing.",
    },

    latestSupremeCourtJudgments: { items: [] },
    latestDelhiHighCourtJudgments: { items: [] },

    newBareActAmendments: { items: [] },
    governmentLegalNotifications: { items: [] },
    tribunalUpdates: { items: [] },
    legalNews: { items: [] },

    weeklySummary: {
      hearingsNext7DaysCount: await Case.countDocuments({
        ...baseFilter,
        nextHearingDate: { $gte: todayStart, $lte: addDays(todayEnd, 7) },
      }),
      weekRange: { from: weekStart, to: weekEnd },
      next: `You have ${weekCasesCount} hearing(s) scheduled this week.`,
    },

    monthlySummary: {
      hearingCountThisMonth: monthCasesCount,
      monthRange: { from: monthStart, to: monthEnd },
    },
  };
}

module.exports = {
  buildTodayBriefing,
};

