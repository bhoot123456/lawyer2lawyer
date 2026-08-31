import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
  ActivityIndicator,
 TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { blurActiveElement } from "@/utils/blurActiveElement";

import {
  SupremeCourtCard,
  SupremeCourtSearchBar,
  SupremeCourtFilters,
  SupremeCourtSkeleton,
  SupremeCourtEmptyState,
  SupremeCourtErrorState,
} from "@/components/supreme-court";
import { getCourtList, toggleFavourite as toggleFavouriteApi } from "@/services/supremeCourtApi";
import type {
  SupremeCourtRoom,
  CourtRoomStatus,
  PaginationMeta,
} from "@/types/supremeCourt";

const ITEMS_PER_PAGE = 20;

/**
 * Compute status counts from court rooms list.
 */
function computeCounts(courts: SupremeCourtRoom[]): Record<string, number> {
  const counts: Record<string, number> = { All: courts.length };
  for (const c of courts) {
    counts[c.status] = (counts[c.status] || 0) + 1;
  }
  return counts;
}

/**
 * Apply search and status filters client-side for instant UX.
 */
function filterCourts(
  courts: SupremeCourtRoom[],
  searchQuery: string,
  activeFilter: CourtRoomStatus | "All"
): SupremeCourtRoom[] {
  let filtered = courts;

  // Filter by status
  if (activeFilter !== "All") {
    filtered = filtered.filter((c) => c.status === activeFilter);
  }

  // Filter by search
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter((c) => c.courtRoom.toLowerCase().includes(q));
  }

  return filtered;
}

/**
 * Supreme Court Screen – displays court rooms with search, filters, and infinite scroll.
 */
export default function SupremeCourtScreen() {
  const [courts, setCourts] = useState<SupremeCourtRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CourtRoomStatus | "All">("All");
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Show a toast notification.
   */
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => {
      setToastVisible(false);
    }, 2000);
  }, []);

  /**
   * Fetch court list from API.
   */
  const fetchCourts = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      try {
        if (pageNum === 1 && !isRefresh) {
          setLoading(true);
        }
        setError(null);

        const response = await getCourtList({
          page: pageNum,
          limit: ITEMS_PER_PAGE,
        });

        const newCourts = response.data || [];

        if (pageNum === 1) {
          setCourts(newCourts);
        } else {
          setCourts((prev) => {
            // Deduplicate by room name
            const existingIds = new Set(prev.map((c) => c.courtRoom));
            const uniqueNew = newCourts.filter(
              (c: SupremeCourtRoom) => !existingIds.has(c.courtRoom)
            );
            return [...prev, ...uniqueNew];
          });
        }

        setPagination(
          response.pagination || {
            page: pageNum,
            limit: ITEMS_PER_PAGE,
            total: newCourts.length,
            totalPages: 1,
            hasMore: false,
          }
        );
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load court list";
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    []
  );

  /**
   * Initial data load.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCourts(1);
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchCourts]);

  /**
   * Pull-to-refresh handler.
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourts(1, true);
  }, [fetchCourts]);

  /**
   * Infinite scroll – load more.
   */
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !pagination.hasMore || loading) return;
    setLoadingMore(true);
    fetchCourts(pagination.page + 1);
  }, [loadingMore, pagination, loading, fetchCourts]);

  /**
   * Toggle favourite for a court room.
   */
  const handleFavouriteToggle = useCallback(
    async (id: string) => {
      // Optimistic update
      setCourts((prev) =>
        prev.map((c) => {
          const cId = c._id || c.id || c.courtRoom;
          if (cId === id) {
            return { ...c, isFavourite: !c.isFavourite };
          }
          return c;
        })
      );

      try {
        await toggleFavouriteApi(id);
      } catch {
        // Revert on failure
        setCourts((prev) =>
          prev.map((c) => {
            const cId = c._id || c.id || c.courtRoom;
            if (cId === id) {
              return { ...c, isFavourite: !c.isFavourite };
            }
            return c;
          })
        );
      }
    },
    []
  );

  /**
   * Handle VC link copy - show toast notification.
   */
  const handleCopyLink = useCallback(
    (vcLink: string) => {
      showToast("Link Copied");
    },
    [showToast]
  );

  /**
   * Share court details.
   */
  const handleShare = useCallback(
    async (court: SupremeCourtRoom) => {
      // Share is handled inside SupremeCourtCard
    },
    []
  );

  /**
   * Join VC – opens the link.
   */
  const handleJoinVC = useCallback(
    async (vcLink: string) => {
      // VC link opening is handled inside SupremeCourtCard
    },
    []
  );

  /**
   * Filter change handler.
   */
  const handleFilterChange = useCallback(
    (filter: CourtRoomStatus | "All") => {
      setActiveFilter(filter);
    },
    []
  );

  /**
   * Clear search query.
   */
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  /**
   * Calculate filter counts based on full courts list.
   */
  const counts = useMemo(() => computeCounts(courts), [courts]);

  /**
   * Get filtered courts for display.
   */
  const filteredCourts = useMemo(
    () => filterCourts(courts, searchQuery, activeFilter),
    [courts, searchQuery, activeFilter]
  );

  /**
   * Render a single court room card.
   */
  const renderCourtCard = useCallback(
    ({ item }: { item: SupremeCourtRoom }) => (
      <SupremeCourtCard
        court={item}
        onFavouriteToggle={handleFavouriteToggle}
        onCopyLink={handleCopyLink}
        onShare={handleShare}
        onJoinVC={handleJoinVC}
      />
    ),
    [handleFavouriteToggle, handleCopyLink, handleShare, handleJoinVC]
  );

  /**
   * Key extractor for FlatList.
   */
  const keyExtractor = useCallback(
    (item: SupremeCourtRoom) => item._id || item.id || item.courtRoom,
    []
  );

  /**
   * Render the header with filters and search.
   */
  const renderHeader = useCallback(
    () => (
      <View>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              blurActiveElement();
              router.back();
            }}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="scale-outline" size={20} color="#D4AF37" style={styles.headerIcon} />
            <View>
              <Text style={styles.headerTitle}>Court List</Text>
              <Text style={styles.headerSubtitle}>Supreme Court of India</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <SupremeCourtSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClearSearch}
        />

        {/* Filters */}
        <SupremeCourtFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={counts}
        />

        {/* Results count */}
        <View style={styles.resultsCount}>
          <Text style={styles.resultsCountText}>
            {filteredCourts.length} court{filteredCourts.length !== 1 ? "s" : ""} found
          </Text>
        </View>
      </View>
    ),
    [
      searchQuery,
      handleClearSearch,
      activeFilter,
      handleFilterChange,
      counts,
      filteredCourts.length,
    ]
  );

  /**
   * Render footer with loading indicator for infinite scroll.
   */
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#B58D3D" />
        <Text style={styles.footerLoaderText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore]);

  /**
   * Render empty state when no results.
   */
  const renderEmptyState = useCallback(() => {
    if (loading) return null;
    return (
      <SupremeCourtEmptyState
        searchQuery={searchQuery}
        activeFilter={activeFilter}
      />
    );
  }, [loading, searchQuery, activeFilter]);

  /**
   * Determine if we should show the main content.
   */
  if (loading && courts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              blurActiveElement();
              router.back();
            }}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="scale-outline" size={20} color="#D4AF37" style={styles.headerIcon} />
            <View>
              <Text style={styles.headerTitle}>Court List</Text>
              <Text style={styles.headerSubtitle}>Supreme Court of India</Text>
            </View>
          </View>
        </View>
        <SupremeCourtSkeleton />
      </View>
    );
  }

  if (error && courts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              blurActiveElement();
              router.back();
            }}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="scale-outline" size={20} color="#D4AF37" style={styles.headerIcon} />
            <View>
              <Text style={styles.headerTitle}>Court List</Text>
              <Text style={styles.headerSubtitle}>Supreme Court of India</Text>
            </View>
          </View>
        </View>
        <SupremeCourtErrorState
          message={error}
          onRetry={() => fetchCourts(1)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredCourts}
        renderItem={renderCourtCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#B58D3D"
            colors={["#B58D3D"]}
            progressBackgroundColor="#1a1a1a"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        removeClippedSubviews={Platform.OS === "android"}
        maxToRenderPerBatch={10}
        windowSize={7}
        initialNumToRender={5}
      />

      {/* Toast notification */}
      {toastVisible && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingTop: Platform.OS === "ios" ? 8 : 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(181, 141, 61, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(181, 141, 61, 0.12)",
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    lineHeight: 40,
  },
  headerTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: "rgba(248, 250, 252, 0.6)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  resultsCount: {
    marginBottom: 14,
  },
  resultsCountText: {
    color: "rgba(248, 250, 252, 0.5)",
    fontSize: 13,
    fontWeight: "700",
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  footerLoaderText: {
    color: "rgba(248, 250, 252, 0.5)",
    fontSize: 13,
    fontWeight: "700",
  },
  toast: {
    position: "absolute",
    bottom: 130,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toastText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
});