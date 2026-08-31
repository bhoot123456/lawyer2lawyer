// Dashboard Types
import type { BriefingPayload } from "@/services/notificationApi";

// Advocate Profile
export interface AdvocateProfile {
  id: string;
  name: string;
  enrollmentNumber: string;
  courtName: string;
  profileImage?: string;
  isOnline?: boolean;
}

// Hearing Item
export interface HearingItem {
  id: string;
  caseId: string;
  caseTitle: string;
  caseNumber: string;
  client: string;
  court: string;
  judge: string;
  courtRoom?: string;
  hearingTime: string;
  nextHearingDate?: string;
  status: "Scheduled" | "Completed" | "Postponed" | "Cancelled" | "Urgent";
}

// Draft Item
export interface DraftItem {
  id: string;
  title: string;
  caseId?: string;
  caseTitle?: string;
  updatedAt?: string;
  dueDate?: string;
  status?: "Draft" | "In Review" | "Pending" | "Completed";
}

// Client Call Item
export interface ClientCallItem {
  id: string;
  clientName: string;
  clientAvatar?: string;
  scheduledAt?: string;
  purpose?: string;
  status?: "Scheduled" | "Completed" | "Missed" | "Pending";
}

// Notification Item
export interface NotificationItem {
  id: string;
  _id?: string;
  title: string;
  message: string;
  body?: string;
  category?: string;
  isRead?: boolean;
  createdAt?: string;
}

// Timeline Item
export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  type: "hearing" | "meeting" | "draft" | "call" | "reminder";
  icon?: string;
}

// Court Holiday
export interface CourtHoliday {
  id: string;
  date: string;
  day: string;
  holidayName: string;
  court: string;
}

// Cause List Entry
export interface CauseListItem {
  id: string;
  caseNumber: string;
  caseTitle: string;
  court: string;
  judge: string;
  courtRoom?: string;
  status: string;
}

// AI Recommendation
export interface AIInsight {
  id: string;
  type: "recommendation" | "judgment" | "alert" | "tip";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
}

// Legal News Item
export interface LegalNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url?: string;
}

// Activity Item
export interface ActivityItem {
  id: string;
  type: "case" | "document" | "payment" | "client" | "hearing";
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}

// Quick Action
export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  screen: string;
  description?: string;
}

// Dashboard Data
export interface DashboardData {
  profile: AdvocateProfile;
  todayHearings: HearingItem[];
  upcomingHearings: HearingItem[];
  pendingDrafts: DraftItem[];
  pendingClientCalls: ClientCallItem[];
  recentNotifications: NotificationItem[];
  courtHolidays: CourtHoliday[];
  causeList: CauseListItem[];
  aiInsights: AIInsight[];
  legalNews: LegalNewsItem[];
  recentActivity: ActivityItem[];
  todayRevenue: number;
  activeCases: number;
  pendingCases: number;
  clientMeetings: number;
}

// Stats
export interface DashboardStats {
  todayHearings: number;
  activeCases: number;
  pendingCases: number;
  revenueToday: number;
  clientMeetings: number;
  pendingDrafts: number;
}

// State types
export type LoadingState = "idle" | "loading" | "loaded" | "error";

// Re-export BriefingPayload for convenience
export type { BriefingPayload };