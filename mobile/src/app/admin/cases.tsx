import React, { useState, useCallback } from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import GlassCard from "@/components/ui/GlassCard";
import SearchBar from "@/components/admin/SearchBar";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getAdminCases, deleteAdminCase, archiveAdminCase } from "@/services/adminApi";

export default function AdminCasesScreen() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Archive/delete in-flight guard (per item) — prevents double-taps.
  const [busyId, setBusyId] = useState<string | null>(null);
  // Cross-platform confirm/notice dialogs (Alert.alert is a no-op on web).
  const { confirm: confirmDialog, notice: noticeDialog, element: dialogElement } = useConfirmDialog();

  const fetchCases = useCallback(async (pg = 1, srch = search, st = statusFilter) => {
    try {
      setLoading(pg === 1);
      const params: any = { page: pg, limit: 20 };
      if (srch) params.search = srch;
      if (st) params.status = st;
      const res = await getAdminCases(params);
      if (res?.success && res?.data) {
        if (pg === 1) setCases(res.data.cases);
        else setCases((prev) => [...prev, ...res.data.cases]);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Fetch cases error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchCases(1); }, []));

  const handleArchive = (id: string) => {
    if (busyId) return; // double-tap guard
    void (async () => {
      const ok = await confirmDialog({
        title: "Archive Case",
        message: "Are you sure you want to archive this case?",
        confirmLabel: "Archive",
      });
      if (!ok || busyId) return;
      setBusyId(id);
      try {
        await archiveAdminCase(id);
        await fetchCases(1);
      } catch (err) {
        noticeDialog({ title: "Error", message: "Failed to archive case", danger: true });
      } finally {
        setBusyId(null);
      }
    })();
  };

  const handleDelete = (id: string) => {
    if (busyId) return; // double-tap guard
    void (async () => {
      const ok = await confirmDialog({
        title: "Delete Case",
        message: "Delete this case? This cannot be undone.",
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok || busyId) return;
      setBusyId(id);
      try {
        await deleteAdminCase(id);
        setCases((prev) => prev.filter((c) => c._id !== id));
      } catch (err) {
        noticeDialog({ title: "Error", message: "Failed to delete case", danger: true });
      } finally {
        setBusyId(null);
      }
    })();
  };

  const STATUSES = ["", "Pending", "Filed", "Notice Issued", "Disposed", "Closed"];

  const renderCase = ({ item }: { item: any }) => (
    <GlassCard>
      <View style={styles.cardRow}>
        <View style={styles.cardContent}>
          <Text style={styles.caseTitle}>{item.caseTitle || item.caseNumber}</Text>
          <Text style={styles.caseNumber}>{item.caseNumber}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.badge, {
              backgroundColor: item.priority === "Urgent" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
              borderColor: item.priority === "Urgent" ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)",
            }]}>
              <Text style={[styles.badgeText, { color: item.priority === "Urgent" ? "#EF4444" : "#10B981" }]}>{item.priority}</Text>
            </View>
            <View style={[styles.badge, {
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              borderColor: "rgba(59, 130, 246, 0.3)",
            }]}>
              <Text style={[styles.badgeText, { color: "#3B82F6" }]}>{item.status}</Text>
            </View>
          </View>
          {item.assignedTo && (
            <Text style={styles.assignedText}>Assigned to: {item.assignedTo.name}</Text>
          )}
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "rgba(59, 130, 246, 0.15)", borderColor: "rgba(59, 130, 246, 0.3)" }]}
          onPress={() => router.push(`/admin/cases/${item._id}` as any)}>
          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
          <Text style={[styles.actionText, { color: "#3B82F6" }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "rgba(245, 158, 11, 0.15)", borderColor: "rgba(245, 158, 11, 0.3)" }]}
          disabled={busyId === item._id}
          onPress={() => handleArchive(item._id)}>
          {busyId === item._id ? (
            <ActivityIndicator size="small" color="#F59E0B" />
          ) : (
            <Ionicons name="archive-outline" size={16} color="#F59E0B" />
          )}
          <Text style={[styles.actionText, { color: "#F59E0B" }]}>Archive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "rgba(239, 68, 68, 0.3)" }]}
          disabled={busyId === item._id}
          onPress={() => handleDelete(item._id)}>
          {busyId === item._id ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          )}
          <Text style={[styles.actionText, { color: "#EF4444" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      <AdminHeader title="Cases Management" subtitle="Manage all cases" showBack />
      <View style={styles.filterRow}>
        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search cases..." />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => { setPage(1); fetchCases(1, search, statusFilter); }}>
          <Ionicons name="search-outline" size={20} color={colors.accent.gold} />
        </TouchableOpacity>
      </View>
      <FlatList horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilterList} contentContainerStyle={styles.statusFilterContent} data={STATUSES}
        renderItem={({ item: s }) => (
          <TouchableOpacity style={[styles.statusFilterBtn, statusFilter === s && styles.statusFilterActive]}
            onPress={() => { setStatusFilter(s); setPage(1); fetchCases(1, search, s); }}>
            <Text style={[styles.statusFilterText, statusFilter === s && styles.statusFilterTextActive]}>{s || "All"}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(s) => s}
      />
      <FlatList
        data={cases}
        renderItem={renderCase}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCases(1); }} tintColor={colors.accent.gold} />}
        ListEmptyComponent={loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.accent.gold} /></View> :
          <View style={styles.center}><Ionicons name="folder-open-outline" size={48} color="#64748B" /><Text style={styles.emptyText}>No cases found</Text></View>}
        onEndReached={() => { if (page < totalPages) { const np = page + 1; setPage(np); fetchCases(np, search, statusFilter); } }}
        onEndReachedThreshold={0.5}
      />
      {dialogElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: "center" },
  searchWrap: { flex: 1 },
  filterBtn: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.accent.goldLight, borderWidth: 1, borderColor: colors.border.goldLight },
  statusFilterList: { maxHeight: 44, marginBottom: 8 },
  statusFilterContent: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  statusFilterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(18, 18, 20, 0.6)", borderWidth: 1, borderColor: colors.border.goldLight },
  statusFilterActive: { backgroundColor: colors.accent.goldLight, borderColor: colors.accent.gold },
  statusFilterText: { color: "#94A3B8", fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  statusFilterTextActive: { color: colors.accent.gold },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  cardRow: { flexDirection: "row", gap: 12 },
  cardContent: { flex: 1 },
  caseTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "800" },
  caseNumber: { color: "#64748B", fontSize: 12, fontWeight: "500", marginTop: 2 },
  metaRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  assignedText: { color: "#94A3B8", fontSize: 12, fontWeight: "600", marginTop: 4 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  actionText: { fontSize: 12, fontWeight: "700" },
  emptyText: { color: "#64748B", fontSize: 14, fontWeight: "600", marginTop: 12 },
});