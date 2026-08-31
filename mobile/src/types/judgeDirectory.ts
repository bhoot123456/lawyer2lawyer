/**
 * A single district court judge as returned from the API.
 * Field mapping: judgeName → name, meetingId → vcMeetingId
 */
export interface DistrictCourtJudge {
  _id: string;
  name: string;
  designation: string;
  jurisdiction: string;
  courtRoom: string;
  vcLink: string;
  vcMeetingId: string;
  email: string;
  isActive: boolean;
  bench?: string;
}

/**
 * API response for the judges list endpoint.
 * GET /api/district-courts/:complexId/:districtId/judges
 */
export interface JudgesListResponse {
  success: boolean;
  complex: string;
  district: string;
  total: number;
  judges: DistrictCourtJudge[];
}

/**
 * Screen state for the judges list.
 */
export interface JudgesListScreenState {
  judges: DistrictCourtJudge[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

/**
 * A judge on leave includes additional leave-related fields.
 */
export interface JudgeOnLeave extends DistrictCourtJudge {
  leaveFrom: string | null;
  leaveTo: string | null;
  leaveReason: string;
}

/**
 * API response for the judges on leave endpoint.
 * GET /api/district-courts/:complexId/:districtId/judges-on-leave
 */
export interface JudgesOnLeaveResponse {
  success: boolean;
  complex: string;
  district: string;
  total: number;
  judges: JudgeOnLeave[];
}

