import React, { useCallback, useState } from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { getCaseById, deleteCase } from "@/services/caseApi";
import { normalizeApiError } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import ErrorState from "@/components/ui/ErrorState";

export default function CaseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseDoc, setCaseDoc] = useState<any>(null);
  // Delete-in-flight flag: disables the delete button (double-tap guard) and
  // shows an item-scoped spinner instead of a full-screen blocker.
  const [deleting, setDeleting] = useState(false);
  // Cross-platform confirm/notice dialogs (Alert.alert is a no-op on web).
  const { confirm: confirmDialog, notice: noticeDialog, element: dialogElement } = useConfirmDialog();

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCaseById(id);
      // Normalized: getCaseById returns the case document
      setCaseDoc(res?.case ?? res);
    } catch (e: any) {
      setError(normalizeApiError(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const nextHearing = caseDoc?.nextHearingDate ? String(caseDoc.nextHearingDate).slice(0, 10) : "-";

  const handleDelete = () => {
    if (deleting || !id) return; // double-tap guard
    void (async () => {
      // Shared ConfirmDialog renders on web too (RN Alert.alert is a no-op there).
      const ok = await confirmDialog({
        title: "Delete Case",
        message: "Delete this case? This cannot be undone.",
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok || deleting || !id) return;
      setDeleting(true);
      try {
        await deleteCase(id!);
        // Success — never keep rendering a case that no longer exists.
        setCaseDoc(null);
        router.replace("/cases");
      } catch (e: any) {
        if (e?.status === 404) {
          // Already deleted in another session/device — treat as gone:
          // drop the stale detail view and land back on the list.
          setCaseDoc(null);
          setDeleting(false);
          noticeDialog({
            title: "Case already deleted",
            message: "This case was already deleted on another device.",
          });
          router.replace("/cases");
          return;
        }
        // Keep the case visible — never remove on failure — and show a
        // specific message (permission / network / server).
        setDeleting(false);
        noticeDialog({
          title: "Couldn't delete case",
          message: e?.message || "Please try again.",
          danger: true,
        });
      }
    })();
  };

  return (
    <>
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.gold} />}
    >
      {loading && <ActivityIndicator size="small" color={colors.accent.gold} />}
      {error ? (
        <ErrorState
          title="Couldn't load this case"
          message={error}
          onRetry={load}
        />
      ) : null}

      {!loading && caseDoc && (
        <>
          <View style={styles.headerCard}>
            <Text style={styles.title} numberOfLines={3}>{caseDoc.caseTitle || "Untitled"}</Text>
            <Text style={styles.caseNo} numberOfLines={1}>Case #{caseDoc.caseNumber}</Text>
            <Text style={styles.sub} numberOfLines={2}>Client: {caseDoc.client || "-"}</Text>
            <Text style={styles.sub} numberOfLines={1}>Status: {caseDoc.status || "-"}</Text>
            <Text style={styles.sub} numberOfLines={1}>Next hearing: {nextHearing}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => router.push(`/cases/${id}/timeline` as any)}
              accessibilityRole="button"
              accessibilityLabel="Open case timeline"
              hitSlop={4}
            >
              <Ionicons name="time-outline" size={18} color="#D4AF37" />
              <Text style={styles.actionText}>Timeline</Text>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => router.push(`/cases/${id}/documents` as any)}
              accessibilityRole="button"
              accessibilityLabel="Open case documents"
              hitSlop={4}
            >
              <Ionicons name="document-text-outline" size={18} color="#D4AF37" />
              <Text style={styles.actionText}>Documents</Text>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => router.push(`/cases/${id}/expenses` as any)}
              accessibilityRole="button"
              accessibilityLabel="Open case expenses"
              hitSlop={4}
            >
              <Ionicons name="cash-outline" size={18} color="#D4AF37" />
              <Text style={styles.actionText}>Expenses</Text>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => router.push(`/cases/${id}/notes` as any)}
              accessibilityRole="button"
              accessibilityLabel="Open case notes"
              hitSlop={4}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#D4AF37" />
              <Text style={styles.actionText}>Notes</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick details</Text>
            <Text style={styles.kv}>Court: <Text style={styles.kvVal}>{caseDoc.court || "-"}</Text></Text>
            <Text style={styles.kv}>Practice Area: <Text style={styles.kvVal}>{caseDoc.practiceArea || "-"}</Text></Text>
            <Text style={styles.kv}>Advocate: <Text style={styles.kvVal}>{caseDoc.advocate || "-"}</Text></Text>
            <Text style={styles.kv}>Priority: <Text style={styles.kvVal}>{caseDoc.priority || "-"}</Text></Text>
          </View>

          <Pressable
            style={styles.editBtn}
            onPress={() => router.push(`/cases/${id}/edit` as any)}
            accessibilityRole="button"
            accessibilityLabel="Edit case"
            accessibilityHint="Opens the case edit form"
            hitSlop={8}
          >
            <Text style={styles.editText}>Edit Case</Text>
          </Pressable>

          <Pressable
            disabled={deleting}
            style={styles.deleteBtn}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel={deleting ? "Deleting case" : "Delete case"}
            accessibilityHint="Asks for confirmation before deleting"
            accessibilityState={{ disabled: deleting, busy: deleting }}
            hitSlop={8}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            )}
            <Text style={styles.deleteText}>{deleting ? "Deleting…" : "Delete Case"}</Text>
          </Pressable>
        </>
      )}

      {dialogElement}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 110,
    backgroundColor: colors.bg.primary,
  },
  headerCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  title: {
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 18,
  },
  caseNo: {
    color: "#D4AF37",
    fontWeight: "800",
    fontSize: 14,
  },
  sub: {
    color: "rgba(248, 250, 252, 0.78)",
    fontWeight: "700",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionBtn: {
    flexBasis: "48%",
    minHeight: 48,
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  actionText: {
    color: "#F8FAFC",
    fontWeight: "800",
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 4,
  },
  kv: {
    color: "rgba(248, 250, 252, 0.78)",
    fontWeight: "700",
    fontSize: 12,
  },
  kvVal: {
    color: "#F8FAFC",
    fontWeight: "800",
  },
  editBtn: {
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: 14,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  editText: {
    color: "#D4AF37",
    fontWeight: "800",
  },
  deleteBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 14,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  deleteText: {
    color: "#ef4444",
    fontWeight: "800",
  },
  error: {
    color: "#f87171",
    fontWeight: "800",
  },
});

