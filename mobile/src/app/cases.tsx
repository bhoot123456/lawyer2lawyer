import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import CaseSearchFilters from "@/components/cases/CaseSearchFilters";
import { getCases, deleteCase } from "@/services/caseApi";
import { normalizeApiError } from "@/services/api";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";

import { Ionicons } from "@expo/vector-icons";
import SkeletonCard from "@/components/ui/SkeletonCard";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

/** Map a case status string to a StatusBadge variant. */
const statusVariant = (status: string | undefined | null): "success" | "warning" | "danger" | "info" | "gold" | "default" => {
  const s = String(status ?? "").toLowerCase();
  if (s === "pending") return "warning";
  if (s === "disposed" || s === "closed") return "success";
  if (s === "urgent") return "danger";
  return "default";
};

export default function CasesPage() {
  const [query, setQuery] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  // Case id currently being deleted — used to show an item-scoped spinner,
  // disable the delete button, and prevent double-taps while in flight.
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Cross-platform confirm/notice dialogs (Alert.alert is a no-op on web).
  const { confirm: confirmDialog, notice: noticeDialog, element: dialogElement } = useConfirmDialog();
  // Monotonic request id — see load() guard below.
  const loadSeqRef = useRef(0);

  const load = useCallback(async (q: any) => {
    setLoading(true);
    setError(null);
    // requestId guard: ignore stale responses when filters change quickly
    // or focus fires while a fetch is already in flight.
    const reqId = ++loadSeqRef.current;
    try {
      const data = await getCases({ query: q });
      if (loadSeqRef.current !== reqId) return;
      setItems(Array.isArray(data?.cases) ? data.cases : []);
      setTotal(Number(data?.total ?? 0));
    } catch (e: any) {
      if (loadSeqRef.current !== reqId) return;
      setError(normalizeApiError(e));
    } finally {
      if (loadSeqRef.current === reqId) setLoading(false);
    }
  }, []);

  // Track latest filter query without re-subscribing the focus effect:
  // previously useFocusEffect depended on `query`, so every keystroke
  // re-registered the effect and re-fetched (compounded by the old
  // per-keystroke onChange). Now focus only loads the latest query.
  const queryRef = useRef(query);
  // Sync the latest filter payload in an effect rather than during render:
  // mutating a ref while rendering is unsafe under concurrent rendering and
  // would let React discard work inconsistently.
  useEffect(() => {
    queryRef.current = query;
  }, [query]);
  useFocusEffect(
    useCallback(() => {
      load(queryRef.current);
    }, [load])
  );

  // Debounced filter change — CaseSearchFilters already debounces
  // internally; this guard also drops identical payloads so tabbing
  // through filters never refires the request.
  const handleFiltersChange = useCallback((q: any) => {
    setQuery((prev: any) =>
      JSON.stringify(prev ?? {}) === JSON.stringify(q ?? {}) ? prev : q,
    );
  }, []);

  // Refetch only when the debounced filter payload actually settles.
  // `handleFiltersChange` returns the previous object when the payload is
  // unchanged, so `query`'s identity is already an accurate change signal —
  // that lets us depend on `query` directly instead of a JSON string.
  // The async IIFE keeps the resulting state updates out of the effect body,
  // matching the pattern used by the case sub-screens (notes/documents/expenses).
  useEffect(() => {
    (async () => {
      await load(query);
    })();
  }, [query, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(queryRef.current);
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  /**
   * Delete flow (optimistic-but-safe):
   *  - Always confirms first via the shared ConfirmDialog (works on web too —
   *    RN `Alert.alert` is a silent no-op on web) — a single accidental tap
   *    can never delete.
   *  - Disables the affected item's button + shows an item-scoped spinner.
   *  - Success (or 404 "already deleted elsewhere"): removes the case from the
   *    local list immediately.
   *  - Any other failure: keeps the case visible and surfaces a specific
   *    error (permission / already-deleted / network / server) via the dialog.
   */
  const handleDelete = (caseItem: any) => {
    const cid = caseItem?._id;
    if (!cid || deletingId) return; // double-tap guard

    void (async () => {
      const ok = await confirmDialog({
        title: "Delete Case",
        message: "Delete this case? This cannot be undone.",
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok || deletingId) return;
      setDeletingId(cid);
      try {
        await deleteCase(cid);
      } catch (e: any) {
        if (e?.status === 404) {
          // Already deleted in another session/device — treat as gone and
          // remove locally with a soft notice.
          noticeDialog({
            title: "Case already deleted",
            message: "This case was already deleted on another device.",
          });
        } else {
          // Keep the case visible — never remove on failure.
          setDeletingId(null);
          noticeDialog({
            title: "Couldn't delete case",
            message: e?.message || "Please try again.",
            danger: true,
          });
          return;
        }
      }
      setItems((prev) => prev.filter((x: any) => String(x._id) !== String(cid)));
      setTotal((prev) => Math.max(0, Number(prev) - 1));
      setDeletingId(null);
    })();
  };

  return (
    <>
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.gold} />}
    >
      <CaseSearchFilters initialQuery={query} onChange={handleFiltersChange} />

      <View style={styles.headerRow}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text style={styles.title}>Cases</Text>
          <Text style={styles.count}>{total} total</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => router.push("/cases/new" as any)}>
          <Ionicons name="add" size={16} color={colors.text.inverse} />
          <Text style={styles.addBtnText}>Add Case</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.85 }]}
        onPress={() => load(queryRef.current)}
        accessibilityRole="button"
        accessibilityLabel="Search cases"
        accessibilityHint="Applies the current filters and reloads the case list"
        hitSlop={8}
      >
        <Ionicons name="refresh-outline" size={16} color={colors.accent.gold} />
        <Text style={styles.refreshText}>Search</Text>
      </Pressable>

      {loading ? (
        <View style={styles.skeletons}>
          <SkeletonCard lines={3} showAvatar={false} showActions={false} />
          <SkeletonCard lines={3} showAvatar={false} showActions={false} />
          <SkeletonCard lines={3} showAvatar={false} showActions={false} />
        </View>
      ) : null}

      {!loading && error ? (
        <ErrorState
          title="Couldn't load cases"
          message={error}
          onRetry={() => void load(queryRef.current)}
        />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No cases yet"
          subtitle="Create your first case to start tracking hearings, notes and documents."
          actionLabel="Create Case"
          onAction={() => router.push("/cases/new" as any)}
          icon={<Ionicons name="briefcase-outline" size={32} color={colors.accent.gold} />}
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <View style={styles.list}>
          {items.map((c, idx) => {
            const cid = c?._id || `case-${idx}`;
            const isDeleting = deletingId === c?._id;
            return (
              <View key={cid} style={styles.card}>
                <Pressable
                  style={({ pressed }) => pressed && { opacity: 0.9 }}
                  onPress={() => router.push(`/cases/${c?._id}` as any)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open case ${c?.caseTitle || c?.caseNumber || "details"}`}
                  accessibilityHint="Opens the case detail screen"
                  hitSlop={4}
                >
                  <View style={styles.cardTop}>
                    <Text style={styles.caseTitle} numberOfLines={2}>
                      {c?.caseTitle || "Untitled"}
                    </Text>
                    {c?.status ? (
                      <StatusBadge label={String(c.status)} variant={statusVariant(c.status)} />
                    ) : null}
                  </View>
                  <Text style={styles.caseMeta} numberOfLines={1}>Case #{c?.caseNumber ?? "—"}</Text>
                  <Text style={styles.caseMeta} numberOfLines={1}>Client: {c?.client || "—"}</Text>
                  <View style={styles.hearingRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.accent.goldDark} />
                    <Text style={styles.hearingText}>
                      Next: {c?.nextHearingDate ? String(c.nextHearingDate).slice(0, 10) : "—"}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  disabled={isDeleting}
                  style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => void handleDelete(c)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete case ${c?.caseTitle || c?.caseNumber || ""}`.trim()}
                  accessibilityHint="Asks for confirmation before deleting"
                  accessibilityState={{ disabled: isDeleting }}
                  hitSlop={8}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                  )}
                  <Text style={styles.deleteBtnText}>{isDeleting ? "Deleting…" : "Delete"}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}

      {dialogElement}
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 120,
    backgroundColor: colors.bg.primary,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    lineHeight: typography.h2.lineHeight,
  },
  count: {
    color: colors.accent.goldDark,
    fontWeight: "800",
    fontSize: typography.caption.fontSize,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    minHeight: 44,
    borderRadius: radii.lg,
    gap: 4,
    ...shadows.level1,
  },
  addBtnText: {
    color: colors.text.inverse,
    fontWeight: "800",
    fontSize: typography.caption.fontSize,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: radii.lg,
    paddingVertical: 12,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  refreshText: {
    color: colors.accent.gold,
    fontWeight: "800",
    fontSize: typography.body.fontSize,
  },
  skeletons: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.level1,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    alignSelf: "flex-end",
    minHeight: 44,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.28)",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  deleteBtnText: {
    color: "#ef4444",
    fontWeight: "800",
    fontSize: typography.overline.fontSize,
  },
  caseTitle: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: 15,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    maxWidth: 140,
  },
  caseStatus: {
    color: colors.accent.gold,
    fontWeight: "700",
    fontSize: typography.overline.fontSize,
    textTransform: "capitalize",
  },
  caseMeta: {
    color: colors.text.secondary,
    fontWeight: typography.caption.fontWeight,
    fontSize: typography.caption.fontSize,
  },
  hearingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  hearingText: {
    color: colors.text.primary,
    fontWeight: "700",
    fontSize: typography.caption.fontSize,
  },
});


