import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  TextStyle,
  ViewStyle,
} from "react-native";
import SectionCard from "@/components/SectionCard";
import { Ionicons } from "@expo/vector-icons";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useThemeColors } from "@/theme/ThemeProvider";
import { colors as designColors, radii, shadows, spacing, typography } from "@/theme/designSystem";

import ActCard from "@/components/acts/ActCard";

import { getBareActs, type BareAct } from "@/services/bareActsApi";

import {
  getRecentlyOpenedBareActs,
  trackRecentlyOpenedBareAct,
} from "@/services/bareActsRecentlyOpenedApi";

import {
  getBareActFavourites,
  addBareActFavourite,
  removeBareActFavourite,
} from "@/services/bareActFavouritesApi";



type BareActListItem = {
  key: string;
  title: string;
  pdfUrl?: string;
  id?: string;
};




const ITEMS_PER_PAGE = 20;

function isValidHttpUrl(url?: string) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function BareActsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<BareAct[]>([]);

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [favouritesLoading, setFavouritesLoading] = useState(false);

  const [recentlyOpened, setRecentlyOpened] = useState<BareAct[]>([]);




  const [loadingRecent, setLoadingRecent] = useState(false);

  // Cross-platform confirm/notice dialogs (Alert.alert is a no-op on web).
  const { notice: noticeDialog, element: dialogElement } = useConfirmDialog();

  const [search, setSearch] = useState("");


  const [category, setCategory] = useState<string>("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const canLoadMore = page < totalPages;

  const normalizeFavouriteIds = (payload: any): string[] => {
    if (!payload) return [];

    // Format 1: { data: { bareActIds: string[] } }
    if (Array.isArray(payload?.data?.bareActIds)) {
      return payload.data.bareActIds.map(String);
    }

    // Format 2: { bareActIds: string[] }
    if (Array.isArray(payload?.bareActIds)) {
      return payload.bareActIds.map(String);
    }

    // Format 3: full acts instead of ids (extract _id)
    const acts = payload?.data?.bareActs ?? payload?.data?.items ?? payload?.data;
    if (Array.isArray(acts)) {
      const ids = acts
        .map((a: any) => a?._id)
        .filter((x: any) => !!x)
        .map(String);
      if (ids.length) return ids;
    }

    // Fallback: try to find any array of objects containing _id
    for (const key of ["items", "bareActs"]) {
      const arr = payload?.data?.[key];
      if (Array.isArray(arr)) {
        const ids = arr
          .map((a: any) => a?._id)
          .filter((x: any) => !!x)
          .map(String);
        if (ids.length) return ids;
      }
    }

    return [];
  };

  const handleToggleFavorite = useCallback(
    async (actId: string) => {
      if (!actId) return;

      // Read current state once for correct optimistic rollback.
      const prevHad = favoriteIds.has(actId);

      // Optimistic update.
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (prevHad) next.delete(actId);
        else next.add(actId);
        return next;
      });

      try {
        if (prevHad) {
          await removeBareActFavourite(actId);
        } else {
          await addBareActFavourite(actId);
        }
      } catch (e) {
        console.log("[favourites] toggle error:", (e as any)?.message || e);

        // Rollback to previous state.
        setFavoriteIds((prev) => {
          const rollback = new Set(prev);
          if (prevHad) rollback.add(actId);
          else rollback.delete(actId);
          return rollback;
        });

        void noticeDialog({ title: "Favourite update failed", message: "Could not update your favourite. Please try again.", danger: true });
      }
    },
    [favoriteIds],
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setFavouritesLoading(true);

        // getBareActFavourites() internally branches:
        // - Anonymous users: resolves from AsyncStorage (no backend call, no 401).
        // - Authenticated users: GET /bare-acts/favourites (behavior unchanged).
        const res = await getBareActFavourites();
        if (cancelled) return;

        const ids = normalizeFavouriteIds(res);
        setFavoriteIds(new Set(ids));
      } catch (e) {
        if (cancelled) return;
        console.log("[favourites] fetch error:", (e as any)?.message || e);
        setFavoriteIds(new Set());
      } finally {
        if (cancelled) return;
        setFavouritesLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
     
  }, []);

  const fetchRecent = useCallback(async () => {
    try {


      setLoadingRecent(true);
      const res = await getRecentlyOpenedBareActs();

      const bareActs = (res as any)?.data?.bareActs ?? (res as any)?.bareActs ?? [];
      setRecentlyOpened(Array.isArray(bareActs) ? bareActs : []);

    } catch (e) {
      console.log('[recentlyOpened] fetchRecent error:', (e as any)?.message || e);
      // silent fail: do not break main list
      setRecentlyOpened([]);
    } finally {
      setLoadingRecent(false);
    }
  }, []);


  const fetchPage = useCallback(
    async (pg: number, mode: "init" | "refresh" | "more") => {
      try {


        if (mode === "init") setLoading(true);
        if (mode === "refresh") setRefreshing(true);
        if (mode === "more") setLoadingMore(true);

        setError(null);

        const res = await getBareActs({
          page: pg,
          limit: ITEMS_PER_PAGE,
          search: search.trim() ? search.trim() : undefined,
          category: category.trim() ? category.trim() : undefined,
          sortBy: "title",
          sortOrder: "asc",
        });

        const bareActs =
          (res as any)?.data?.items ??
          (res as any)?.data?.bareActs ??
          (res as any)?.items ??
          (res as any)?.bareActs ??
          [];

        const nextTotalPages =
          res?.pagination?.totalPages ||
          (res?.pagination?.totalItems
            ? Math.max(1, Math.ceil(res.pagination.totalItems / (res.pagination.limit || ITEMS_PER_PAGE)))
            : 1);

        setTotalPages(nextTotalPages);

        setPage(pg);

        if (mode === "init" || mode === "refresh") {
          setItems(Array.isArray(bareActs) ? bareActs : []);
        } else {
          setItems((prev) => {
            const seen = new Set((prev || []).map((x: any) => x._id || x.slug || x.title || ""));
            const merged = (Array.isArray(bareActs) ? bareActs : []).filter((x: any) => {
              const id = x._id || x.slug || x.title || "";
              if (!id) return false;
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            });
            return [...prev, ...merged];
          });
        }
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to load bare acts",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [search, category],
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Always load main list immediately.
      fetchPage(1, "init");

      // getRecentlyOpenedBareActs() now resolves locally for anonymous users
      // (AsyncStorage) and from the backend for authenticated users, so calling
      // it unconditionally is safe and avoids 401s on the protected
      // /bare-acts/recent endpoints for anonymous users.
      if (cancelled) return;
      await fetchRecent();
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [fetchPage, fetchRecent]);


  const onRefresh = useCallback(() => {
    fetchPage(1, "refresh");
  }, [fetchPage]);

  const onRetry = useCallback(() => {
    fetchPage(1, "init");
  }, [fetchPage]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      const c = it.category;
      if (c) set.add(String(c));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const listData: BareActListItem[] = useMemo(() => {
    return items.reduce<BareActListItem[]>((acc, x) => {
      const title = x.title || x.actName || x.shortName;
      const pdfUrl = x.pdfUrl;
      const id = x._id || x.slug || title;
      if (!title || !id) return acc;
      acc.push({
        key: String(id),
        id: String(id),
        title: String(title),
        pdfUrl,
      });

      return acc;
    }, []);
  }, [items]);

  const openPdf = useCallback(
    (pdfUrl?: string, bareActId?: string, act?: BareAct | BareActListItem) => {
      if (!pdfUrl || !isValidHttpUrl(pdfUrl)) {
        void noticeDialog({ title: "Invalid PDF URL", message: "This act PDF URL is not valid.", danger: true });
        return;
      }

      // Track asynchronously; never block PDF opening.
      // For anonymous users the API persists to AsyncStorage (no auth header,
      // no 401). For authenticated users it POSTs to the protected backend.
      if (bareActId) {
        trackRecentlyOpenedBareAct(bareActId, act)
          .then(() => {
            fetchRecent().catch(() => {});
          })
          .catch(() => {});
      }

      Linking.openURL(pdfUrl).catch(() => {
        void noticeDialog({ title: "Unable to open PDF", message: "Please try again.", danger: true });
      });
    },
    [fetchRecent],
  );


  const renderHeader = useCallback(() => {
    // console.log('[recentlyOpened] renderHeader recentlyOpened.length:', recentlyOpened?.length || 0);
    return (
      <View style={styles.header}>

        <Text style={styles.pageTitle as TextStyle}>Bare Acts (India)</Text>
        <Text style={styles.pageSubtitle as TextStyle}>Tap any act to open its PDF.</Text>

        {!!recentlyOpened?.length && (
          <View style={styles.recentWrap}>
            <Text style={styles.recentTitle as TextStyle}>Recently Opened</Text>
            <View style={styles.recentList}>
              {recentlyOpened.slice(0, 5).map((act: any) => {
                const title = act?.title || act?.actName || act?.shortName;
                const id = act?._id || act?.slug || title;
                if (!title || !id) return null;

                return (
                  <Pressable
                    key={String(id)}
                    style={styles.recentCard}
                    onPress={() => openPdf(act?.pdfUrl, String(id), act)}
                  >
                    <Text style={styles.recentCardTitle as TextStyle} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={styles.recentCardLink as TextStyle}>Open</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* <View style={styles.sectionWrap}>
          <SectionCard
            title="Bare Acts"
            description="Browse acts and open the PDF when needed."
            ctaText={"View list"}
            onPress={() => {
              // intentionally no-op; this screen already shows the list
            }}
          />
        </View> */}

        <View style={styles.filtersRow}>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#D4AF37" />

            <View style={{ flex: 1 }}>
              <Text
                style={styles.searchLabel as TextStyle}
                onPress={() => {
                  // Keeping UI stable; users can use platform keyboard via existing navigation.
                }}
              >
                Search: {search || "COMMING SOON"}
              </Text>
            </View>
          </View>

          <View style={styles.categoryWrap}>
            <Text style={styles.searchLabel as TextStyle}>Category: {category || "All"}</Text>
            <View style={styles.categoryPills}>
              <Pressable
                style={[styles.pill, !category && styles.pillActive]}
                onPress={() => setCategory("")}
              >
                <Text style={[styles.pillText as TextStyle, !category && styles.pillTextActive]}>All</Text>

              </Pressable>
              {categoryOptions.slice(0, 4).map((c) => (
                <Pressable
                  key={c}
                  style={[styles.pill, category === c && styles.pillActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text
                    style={[
                      styles.pillText as TextStyle,
                      category === c && styles.pillTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }, [category, categoryOptions, search, recentlyOpened, loadingRecent]);

  const renderItem = useCallback(
    ({ item }: { item: BareActListItem }) => {
      const actForCard = {
        id: item.id || item.key,
        title: item.title,
        pdfUrl: item.pdfUrl,
        category: "Criminal Law",
        year: undefined,
        shortDescription: undefined,
        searchSupport: undefined,
        favoriteSupported: true,
        bookmarkSupported: true,
        aiExplanationSupported: false,
      };

      return (
        <ActCard
          act={actForCard}
          isFavorited={favoriteIds.has(String(actForCard.id))}
          isBookmarked={false}
          onToggleFavorite={(actId) => handleToggleFavorite(actId)}
          onToggleBookmark={() => {}}
          onPressPrimary={(actId) => openPdf(item.pdfUrl, actId, item)}
        />
      );
    },
    [favoriteIds, handleToggleFavorite, openPdf],
  );


  const keyExtractor = useCallback((it: BareActListItem) => it.key, []);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#D4AF37" />
        <Text style={styles.loadingText as TextStyle}>Loading more…</Text>
      </View>
    );
  }, [loadingMore]);

  if (loading && items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#D4AF37" />
          <Text style={styles.loadingText as TextStyle}>Loading…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (canLoadMore && !loadingMore && !loading && listData.length > 0) {
            fetchPage(page + 1, "more");
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4AF37"
            colors={["#D4AF37"]}
            progressBackgroundColor="#f5f0f0"
          />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.note}>
              <Text style={styles.noteText as TextStyle}>{error}</Text>
              <Pressable style={styles.retryBtn} onPress={onRetry}>
                <Text style={styles.retryText as TextStyle}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.note}>
              <Text style={styles.noteText as TextStyle}>No bare acts available.</Text>
            </View>
          )
        }
      />
      {dialogElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: designColors.bg.primary } as ViewStyle,
  recentWrap: {
    backgroundColor: designColors.bg.surface,
    borderWidth: 1,
    borderColor: designColors.border.gold,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: spacing.sm,
  } as ViewStyle,
  recentTitle: {
    color: designColors.accent.gold,
    fontWeight: "800",
    fontSize: 14,
  } as TextStyle,
  recentList: {
    flexDirection: "column",
    gap: spacing.sm,
  } as ViewStyle,
  recentCard: {
    backgroundColor: designColors.accent.goldSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: designColors.border.gold,
    padding: spacing.sm,
    gap: 3,
  } as ViewStyle,
  recentCardTitle: {
    color: designColors.accent.gold,
    fontWeight: "800",
    fontSize: 12,
  } as TextStyle,
  recentCardLink: {
    color: designColors.semantic.info,
    fontSize: 12,
    fontWeight: "800",
  } as TextStyle,

  body: {
    padding: spacing.md,
    paddingBottom: 110,
    gap: spacing.md,
  } as ViewStyle,
  header: {
    padding: spacing.md,
    paddingBottom: 0,
    gap: spacing.md,
  } as ViewStyle,
  listContent: {
    paddingBottom: 110,
    gap: spacing.md,
  } as ViewStyle,
  sectionWrap: { marginTop: spacing.xs } as ViewStyle,
  pageTitle: {
    color: designColors.accent.gold,
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    marginTop: spacing.sm,
  } as TextStyle,
  pageSubtitle: {
    color: designColors.text.muted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
    lineHeight: typography.caption.lineHeight,
  } as TextStyle,
  center: {
    marginTop: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  } as ViewStyle,
  loadingText: { color: designColors.text.muted, fontSize: typography.caption.fontSize, marginTop: spacing.xs } as TextStyle,
  note: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
    backgroundColor: designColors.accent.goldSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: designColors.border.gold,
    gap: spacing.md,
    alignItems: "center",
  } as ViewStyle,
  noteText: { color: designColors.text.secondary, fontSize: typography.caption.fontSize, lineHeight: 18, textAlign: "center" } as TextStyle,
  list: { gap: spacing.md, marginTop: spacing.xs } as ViewStyle,
  card: {
    marginHorizontal: spacing.md,
    backgroundColor: designColors.bg.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: designColors.border.gold,
    gap: spacing.xs,
    ...shadows.level1,
  } as ViewStyle,
  cardTitle: {
    color: designColors.accent.gold,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  } as TextStyle,
  cardLink: {
    color: designColors.semantic.info,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
  } as TextStyle,

  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md } as ViewStyle,

  filtersRow: {
    gap: spacing.md,
    marginTop: spacing.xs,
  } as ViewStyle,
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: designColors.bg.surface,
    borderWidth: 1,
    borderColor: designColors.border.gold,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  } as ViewStyle,
  categoryWrap: {
    backgroundColor: designColors.bg.surface,
    borderWidth: 1,
    borderColor: designColors.border.goldLight,
    borderRadius: radii.md,
    padding: spacing.sm,
  } as ViewStyle,
  categoryPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  } as ViewStyle,
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: designColors.border.default,
    backgroundColor: designColors.bg.elevated,
  } as ViewStyle,
  pillActive: {
    borderColor: designColors.accent.gold,
    backgroundColor: designColors.accent.goldSubtle,
  } as ViewStyle,
  pillText: { color: designColors.text.secondary, fontWeight: "800", fontSize: 12, maxWidth: 120 } as TextStyle,
  pillTextActive: { color: designColors.accent.gold } as TextStyle,
  searchLabel: { color: designColors.text.muted, fontWeight: "800", fontSize: 12 } as TextStyle,

  retryBtn: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: designColors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: designColors.border.gold,
  } as ViewStyle,
  retryText: { color: designColors.accent.gold, fontWeight: "800", fontSize: 13 } as TextStyle,

  footerLoader: {
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
  } as ViewStyle,
});