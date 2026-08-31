import api from "@/services/api";
import type { CourtListResponse, SupremeCourtRoom } from "@/types/supremeCourt";

/**
 * Fetch the supreme court room list with optional filters and pagination.
 */
export async function getCourtList(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<CourtListResponse> {
  const res = await api.get("/supreme-court/court-list", { params });
  return res.data;
}

/**
 * Toggle favourite status for a court room.
 */
export async function toggleFavourite(id: string): Promise<{
  success: boolean;
  data: SupremeCourtRoom;
}> {
  const res = await api.post(`/supreme-court/court-list/${id}/favourite`);
  return res.data;
}