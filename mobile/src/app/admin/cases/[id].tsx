import React, { useCallback, useState } from "react";
import { colors, radii, spacing, typography } from "@/theme/designSystem";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { getAdminCaseById, deleteAdminCase } from "@/services/adminApi";
import { Ionicons } from "@expo/vector-icons";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminCaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseDoc, setCaseDoc] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { confirm: confirmDialog, notice: noticeDialog, element: dialogElement } = useConfirmDialog();

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminCaseById(id);
      setCaseDoc(res?.data ?? res);
    } catch (e: any) {
      setError(e?.message || "Failed to load case");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  const handleDelete = () => {
    if (deleting || !id) return;
    void (async () => {
      const ok = await confirmDialog({
        title: "Delete Case",
        message: "Delete this case? This cannot be undone.",
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok || deleting || !id) return;
      setDeleting(true);
      try {
        await deleteAdminCase(id!);
        setCaseDoc(null);
        router.replace("/admin/cases");
      } catch (e: any) {
        setDeleting(false);
        noticeDialog({
          title: "Couldn't delete case",
          message: e?.message || "Please try again.",
          danger: true,
        });
      }
    })();
  };

  const nextHearing = caseDoc?.nextHearingDate ? String(caseDoc.nextHearingDate).slice(0, 10) : "-";

  return (
    <>
      <AdminHeader title="Case Details" subtitle={caseDoc?.caseTitle || caseDoc?.caseNumber || "Loading..."} showBack />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.accent.gold} />}
      >
        {loading && !caseDoc ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent.gold} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.semantic.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => void load()}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : caseDoc ? (
          <View style={styles.inner}>
            <View style={styles.headerCard}>
              <Text style={styles.title}>{caseDoc.caseTitle || "Untitled Case"}</Text>
              <Text style={styles.caseNo}>{caseDoc.caseNumber}</Text>
              <Text style={styles.sub}>{caseDoc.practiceArea || "General"}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Case Information</Text>
              <Text style={styles.kv}>Status: <Text style={styles.kvVal}>{caseDoc.status || "-"}</Text></Text>
              <Text style={styles.kv}>Priority: <Text style={styles.kvVal}>{caseDoc.priority || "-"}</Text></Text>
              <Text style={styles.kv}>Client: <Text style={styles.kvVal}>{caseDoc.client || "-"}</Text></Text>
              <Text style={styles.kv}>Court: <Text style={styles.kvVal}>{caseDoc.court || "-"}</Text></Text>
              <Text style={styles.kv}>Practice Area: <Text style={styles.kvVal}>{caseDoc.practiceArea || "-"}</Text></Text>
              <Text style={styles.kv}>Advocate: <Text style={styles.kvVal}>{caseDoc.advocate || "-"}</Text></Text>
              <Text style={styles.kv}>Next Hearing: <Text style={styles.kvVal}>{nextHearing}</Text></Text>
            </View>
            <Pressable disabled={deleting} style={styles.deleteBtn} onPress={handleDelete}>
              {deleting ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              )}
              <Text style={styles.deleteText}>{deleting ? "Deleting..." : "Delete Case"}</Text>
            </Pressable>
          </View>
        ) : null}
        {dialogElement}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  contentContainer: {
    padding: spacing.md,
    gap: 12,
    paddingBottom: 110,
  },
  inner: {
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: spacing.sm,
  },
  headerCard: {
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: 6,
  },
  title: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: typography.h3.fontSize,
  },
  caseNo: {
    color: colors.accent.gold,
    fontWeight: "800",
    fontSize: typography.body.fontSize,
  },
  sub: {
    color: colors.text.secondary,
    fontWeight: "700",
    fontSize: typography.caption.fontSize,
  },
  section: {
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: 8,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: typography.h4.fontSize,
    marginBottom: 4,
  },
  kv: {
    color: colors.text.secondary,
    fontWeight: "700",
    fontSize: typography.caption.fontSize,
  },
  kvVal: {
    color: colors.text.primary,
    fontWeight: "800",
  },
  deleteBtn: {
    backgroundColor: colors.semantic.dangerSubtle,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: radii.lg,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  deleteText: {
    color: colors.semantic.danger,
    fontWeight: "800",
  },
  errorText: {
    color: colors.semantic.danger,
    fontWeight: "800",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.gold,
  },
  retryText: {
    color: colors.accent.gold,
    fontWeight: "800",
    fontSize: 13,
  },
});