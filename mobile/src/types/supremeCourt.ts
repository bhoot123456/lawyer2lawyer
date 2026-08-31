/**
 * Status of a supreme court room hearing.
 */
export type CourtRoomStatus = "Live" | "Scheduled" | "Offline";

/**
 * Supreme court room data from the API.
 */
export interface SupremeCourtRoom {
  _id?: string;
  id?: string;
  courtRoom: string;
  vcLink: string;
  meetingId: string;
  email: string;
  status: CourtRoomStatus;
  isFavourite?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Pagination metadata from the API.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * API response for the court list endpoint.
 */
export interface CourtListResponse {
  success: boolean;
  data: SupremeCourtRoom[];
  pagination: PaginationMeta;
}

/**
 * Filter option for court list.
 */
export interface FilterOption {
  label: string;
  value: CourtRoomStatus | "All";
  icon: string;
}

/**
 * State for the supreme court screen.
 */
export interface SupremeCourtScreenState {
  courts: SupremeCourtRoom[];
  filteredCourts: SupremeCourtRoom[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  searchQuery: string;
  activeFilter: CourtRoomStatus | "All";
  pagination: PaginationMeta;
  page: number;
}

/**
 * Props for the SupremeCourtCard component.
 */
export interface SupremeCourtCardProps {
  court: SupremeCourtRoom;
  onFavouriteToggle: (id: string) => void;
  onCopyLink: (vcLink: string) => void;
  onShare: (court: SupremeCourtRoom) => void;
  onJoinVC: (vcLink: string) => void;
}

/**
 * Props for the SupremeCourtFilters component.
 */
export interface SupremeCourtFiltersProps {
  activeFilter: CourtRoomStatus | "All";
  onFilterChange: (filter: CourtRoomStatus | "All") => void;
  counts: Record<string, number>;
}

/**
 * Props for the SupremeCourtSearchBar component.
 */
export interface SupremeCourtSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}