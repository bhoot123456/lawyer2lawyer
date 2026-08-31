import { api } from "@/services/api";

export type BriefingPayload = any;

export async function getTodayBriefing(): Promise<BriefingPayload> {
  const res = await api.get("/notifications/briefing/today");
  return res.data?.data;
}

export async function listNotifications(params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: "unread" | "read";
}) {
  const res = await api.get("/notifications", {
    params,
  });
  return res.data;
}

export async function markNotificationRead(id: string) {
  const res = await api.post(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.post("/notifications/read-all");
  return res.data;
}

