import api from "@/services/api";
import type { JudgesListResponse, JudgesOnLeaveResponse } from "@/types/judgeDirectory";

/**
 * Fetch all published judges for a given Delhi High Court courtId.
 *
 * GET /api/judge-directory/:courtId
 *
 * @param courtId - Court identifier (e.g., "delhi-high-court")
 * @returns API response with judges array, total count, and courtId
 */
export async function getJudgesByCourt(
  courtId: string,
): Promise<{ success: boolean; data: { judges: any[]; total: number; courtId: string } }> {
  const res = await api.get(
    `/judge-directory/${encodeURIComponent(courtId)}`,
  );
  return res.data;
}

/**
 * Fetch all published judges for a given district court complex and district.
 *
 * GET /api/district-courts/:complexId/:districtId/judges
 *
 * @param complexId - Court complex identifier (e.g., "rohini")
 * @param districtId - District identifier (e.g., "north")
 * @returns Judges list response
 */
export async function getJudgesByDistrict(
  complexId: string,
  districtId: string,
): Promise<JudgesListResponse> {
  const res = await api.get(
    `/district-courts/${encodeURIComponent(complexId)}/${encodeURIComponent(districtId)}/judges`,
  );
  return res.data;
}

/**
 * Fetch all published judges currently on leave for a given district court complex and district.
 *
 * GET /api/district-courts/:complexId/:districtId/judges-on-leave
 *
 * @param complexId - Court complex identifier (e.g., "rohini")
 * @param districtId - District identifier (e.g., "north")
 * @returns Judges on leave response with leave metadata
 */
export async function getJudgesOnLeave(
  complexId: string,
  districtId: string,
): Promise<JudgesOnLeaveResponse> {
  const res = await api.get(
    `/district-courts/${encodeURIComponent(complexId)}/${encodeURIComponent(districtId)}/judges-on-leave`,
  );
  return res.data;
}

