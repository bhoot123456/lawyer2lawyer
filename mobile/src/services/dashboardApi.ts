import { api, getAuthToken, clearSession } from "@/services/api";
import { parseValidDate } from "@/utils/dateUtils";
import type {
  AdvocateProfile,
  HearingItem,
  DraftItem,
  ClientCallItem,
  CourtHoliday,
  CauseListItem,
  AIInsight,
  LegalNewsItem,
  ActivityItem,
  DashboardData,
  DashboardStats,
} from "@/components/dashboard/types";

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value : []);

/**
 * True when the error is an HTTP 401 from a personal-data endpoint.
 *
 * Personal endpoints (/client-calls, /activity/recent, /dashboard/stats,
 * /draft-library) require a valid user JWT. In the no-login architecture a
 * stored token can exist but be stale/expired/revoked (left over from an
 * earlier session). A 401 reaching these fetchers means the refresh
 * interceptor could not recover the session, i.e. the stored session is dead:
 * clear it so the app falls back to the anonymous (device-scoped) experience
 * and stops sending doomed requests. Expected failures resolve to empty
 * states — they never crash the UI.
 */
function isUnauthorized(error: unknown): boolean {
  return (error as any)?.response?.status === 401;
}

// Default advocate profile used when no user is authenticated (no-login architecture).
// Neutral fallbacks only — never imply a real professional identity.
const DEFAULT_PROFILE: AdvocateProfile = {
  id: "default",
  name: "Advocate",
  enrollmentNumber: "N/A",
  courtName: "",
  isOnline: true,
};

// Get current advocate profile.
// In the no-login architecture there is no /auth/me call for anonymous users.
// Authenticated users can still fetch their profile if needed elsewhere, but
// the normal-user dashboard uses a sensible default that requires no backend.
export async function getAdvocateProfile(): Promise<AdvocateProfile> {
  return DEFAULT_PROFILE;
}

export async function getTodayHearings(): Promise<HearingItem[]> {
  // Anonymous users can have their own cases now.

  try {
    const res = await api.get("/cases", {
      // Backend filter contract: `nextHearing` (YYYY-MM-DD) filters the exact day.
      params: { nextHearing: new Date().toISOString().split("T")[0] },
    });
    const cases = res.data?.cases || res.data || [];
    return asArray<any>(cases).map((c) => ({
      id: c._id || c.id,
      caseId: c._id || c.id,
      caseTitle: c.caseTitle || c.title,
      caseNumber: c.caseNumber,
      client: c.client,
      court: c.court,
      judge: c.judge,
      courtRoom: c.courtRoom,
      hearingTime: c.nextHearingDate
        ? (() => {
            const parsed = parseValidDate(c.nextHearingDate);
            return parsed
              ? parsed.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";
          })()
        : "",
      nextHearingDate: c.nextHearingDate,
      status: c.status || "Scheduled",
    }));
  } catch {
    return [];
  }
}

export async function getUpcomingHearings(): Promise<HearingItem[]> {
  // Anonymous users can have their own cases now.

  try {
    const res = await api.get("/cases", {
      // Backend does not support $gte range filters via query params.
      // Request the soonest-scheduled cases and filter future ones client-side.
      params: {
        sortBy: "nextHearingDate",
        sortOrder: "asc",
        limit: 100,
      },
    });
    const cases = res.data?.cases || res.data || [];
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return asArray<any>(cases)
      .map((c) => ({
        id: c._id || c.id,
        caseId: c._id || c.id,
        caseTitle: c.caseTitle || c.title,
        caseNumber: c.caseNumber,
        client: c.client,
        court: c.court,
        judge: c.judge,
        courtRoom: c.courtRoom,
        hearingTime: c.nextHearingDate
          ? (() => {
              const parsed = parseValidDate(c.nextHearingDate);
              return parsed
                ? parsed.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";
            })()
          : "",
        nextHearingDate: c.nextHearingDate,
        status: c.status || "Scheduled",
      }))
      .filter((h) => {
        if (!h.nextHearingDate) return false;
        const parsed = parseValidDate(h.nextHearingDate);
        return !!(parsed && parsed >= startOfToday);
      });
  } catch {
    return [];
  }
}

// Get pending drafts (personal/user-specific)
export async function getPendingDrafts(): Promise<DraftItem[]> {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const res = await api.get("/draft-library", {
      params: { status: "pending" },
    });
    const drafts = res.data?.templates || res.data || [];
    return asArray<any>(drafts).map((d) => ({
      id: d._id || d.id,
      title: d.title || d.name,
      caseId: d.caseId,
      caseTitle: d.caseTitle,
      updatedAt: d.updatedAt,
      dueDate: d.dueDate,
      status: d.status || "Pending",
    }));
  } catch (e) {
    if (isUnauthorized(e)) await clearSession(); // stale session — self-heal
    return [];
  }
}

// Get pending client calls (personal/user-specific)
export async function getPendingClientCalls(): Promise<ClientCallItem[]> {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const res = await api.get("/client-calls", {
      params: { status: "pending" },
    });
    const calls = res.data?.calls || res.data || [];
    return asArray<any>(calls).map((c) => ({
      id: c._id || c.id,
      clientName: c.clientName || c.name,
      clientAvatar: c.clientAvatar,
      scheduledAt: c.scheduledAt,
      purpose: c.purpose,
      status: c.status || "Pending",
    }));
  } catch (e) {
    if (isUnauthorized(e)) await clearSession(); // stale session — self-heal
    return [];
  }
}

// Get court holidays
export async function getCourtHolidays(): Promise<CourtHoliday[]> {
  try {
    const res = await api.get("/court-holidays", {
      params: { upcoming: true },
    });
    const holidays = res.data?.holidays || res.data || [];
    return asArray<any>(holidays).map((h) => ({
      id: h._id || h.id,
      date: h.date,
      day: h.day,
      holidayName: h.holidayName || h.name,
      court: h.court,
    }));
  } catch {
    return [];
  }
}

// Get cause list
export async function getCauseList(): Promise<CauseListItem[]> {
  try {
    const res = await api.get("/daily-cause-list", {
      params: { date: new Date().toISOString().split("T")[0] },
    });
    const entries = res.data?.entries || res.data || [];
    return asArray<any>(entries).map((e) => ({
      id: e._id || e.id,
      caseNumber: e.caseNumber,
      caseTitle: e.caseTitle,
      court: e.court,
      judge: e.judge,
      courtRoom: e.courtRoom,
      status: e.status,
    }));
  } catch {
    return [];
  }
}

// Get AI insights
export async function getAIInsights(): Promise<AIInsight[]> {
  try {
    const res = await api.get("/ai/insights", {
      params: { limit: 5 },
    });
    const insights = res.data?.insights || res.data || [];
    return asArray<any>(insights).map((i) => ({
      id: i._id || i.id,
      type: i.type || "recommendation",
      title: i.title,
      description: i.description,
      priority: i.priority || "medium",
    }));
  } catch {
    return [];
  }
}

// Get legal news
export async function getLegalNews(): Promise<LegalNewsItem[]> {
  try {
    const res = await api.get("/legal-news", {
      params: { limit: 5 },
    });
    const news = res.data?.news || res.data || [];
    return asArray<any>(news).map((n) => ({
      id: n._id || n.id,
      title: n.title,
      summary: n.summary,
      source: n.source,
      publishedAt: n.publishedAt,
      url: n.url,
    }));
  } catch {
    return [];
  }
}

// Get recent activity (personal/user-specific — notifications are scoped to the user)
export async function getRecentActivity(): Promise<ActivityItem[]> {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const res = await api.get("/activity/recent", {
      params: { limit: 10 },
    });
    const activities = res.data?.activities || res.data || [];
    return asArray<any>(activities).map((a) => ({
      id: a._id || a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      timestamp: a.timestamp || a.createdAt,
      icon: a.icon,
    }));
  } catch (e) {
    if (isUnauthorized(e)) await clearSession(); // stale session — self-heal
    return [];
  }
}

// Get dashboard stats (personal/user-specific — case/draft counts are scoped to the user)
export async function getDashboardStats(): Promise<DashboardStats> {
  const token = await getAuthToken();
  if (!token) {
    // Anonymous (device-scoped) users own their cases, so compute the counts
    // from their device-scoped case list instead of returning zeros.
    try {
      const res = await api.get("/cases", { params: { limit: 100 } });
      const cases = res.data?.cases || res.data || [];
      const list = asArray<any>(cases);
      const isActive = (s: unknown) => s !== "Disposed" && s !== "Closed";
      return {
        todayHearings: 0,
        activeCases: list.filter((c) => isActive(c.status)).length,
        pendingCases: list.filter((c) => c.status === "Pending").length,
        revenueToday: 0,
        pendingDrafts: 0,
        clientMeetings: 0,
      };
    } catch {
      return {
        todayHearings: 0,
        activeCases: 0,
        pendingCases: 0,
        revenueToday: 0,
        pendingDrafts: 0,
        clientMeetings: 0,
      };
    }
  }

  try {
    const res = await api.get("/dashboard/stats");
    const stats = res.data?.stats || res.data || {};
    return {
      todayHearings: stats.todayHearings || 0,
      activeCases: stats.activeCases || 0,
      pendingCases: stats.pendingCases || 0,
      revenueToday: stats.revenueToday || 0,
      clientMeetings: stats.clientMeetings || 0,
      pendingDrafts: stats.pendingDrafts || 0,
    };
  } catch (e) {
    if (isUnauthorized(e)) await clearSession(); // stale session — self-heal
    return {
      todayHearings: 0,
      activeCases: 0,
      pendingCases: 0,
      revenueToday: 0,
      clientMeetings: 0,
      pendingDrafts: 0,
    };
  }
}

// Get all dashboard data
export async function getDashboardData(): Promise<DashboardData> {
  const [
    profile,
    todayHearings,
    upcomingHearings,
    pendingDrafts,
    pendingClientCalls,
    courtHolidays,
    causeList,
    aiInsights,
    legalNews,
    recentActivity,
    stats,
  ] = await Promise.all([
    getAdvocateProfile(),
    getTodayHearings(),
    getUpcomingHearings(),
    getPendingDrafts(),
    getPendingClientCalls(),
    getCourtHolidays(),
    getCauseList(),
    getAIInsights(),
    getLegalNews(),
    getRecentActivity(),
    getDashboardStats(),
  ]);

  return {
    profile,
    todayHearings,
    upcomingHearings,
    pendingDrafts,
    pendingClientCalls,
    recentNotifications: [],
    courtHolidays,
    causeList,
    aiInsights,
    legalNews,
    recentActivity,
    todayRevenue: stats.revenueToday,
    activeCases: stats.activeCases,
    pendingCases: stats.pendingCases,
    clientMeetings: stats.clientMeetings,
  };
}

// Format money in INR
export function formatMoneyINR(amount: number): string {
  if (!Number.isFinite(amount)) return "₹ 0";
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

// Get greeting based on time
export function getGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}
