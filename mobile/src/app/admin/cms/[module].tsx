import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import SearchBar from "@/components/admin/SearchBar";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import {
  cmsList,
  cmsStatusAction,
  cmsDelete,
  getCmsModules,
  type CmsModuleMeta,
} from "@/services/adminApi";

const STATUS_FILTERS = ["", "published", "draft", "archived"];

export default function CmsModuleScreen() {
  const { module: moduleKey } = useLocalSearchParams<{ module: string }>();
  const { has } = useAdminPermissions();
  const [meta, setMeta] = useState<CmsModuleMeta | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<any>(null);

  useEffect(() => {
    getCmsModules()
      .then((mods) => setMeta(mods.find((m) => m.key === moduleKey) || null))
      .catch(() => {});
  }, [moduleKey]);

  const fetchData = useCallback(
    async (page = 1) => {
      try {
        setError("");
        const res = await cmsList(moduleKey, {
          page,
          limit: 20,
          ...(search ? { search } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
        });
        if (res?.success) {
          setItems(res.data.items || []);
          setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load records");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [moduleKey, search, statusFilter],
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData(1);
    }, [fetchData]),
  );

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      fetchData(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const permKey = meta?.permissionKey || String(moduleKey || "").replace(/-/g, "_");
  const canCreate = has(`${permKey}.create`);
  const canEdit = has(`${permKey}.edit`);
  const canPublish = has(`${permKey}.publish`);
  const canDelete = has(`${permKey}.delete`);

  const applyAction = async (item: any, action: string) => {
    try {
      await cmsStatusAction(moduleKey, item._id, action as any);
      fetchData(pagination.page);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Action failed");
    }
  };

  const doDelete = async () => {
    if (!confirmTarget) return;
    try {
      await cmsDelete(moduleKey, confirmTarget._id);
      setConfirmTarget(null);
      fetchData(pagination.page);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Delete failed");
      setConfirmTarget(null);
    }
  };

  const titleOf = (item: any) =>
    item.title || item.name || item.label || item.judgeName || item.courtRoom || item.caseTitle || item._id;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardMain}
        disabled={!canEdit}
        onPress={() => router.push(`/admin/cms/${moduleKey}/${item._id}` as any)}
      >
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{titleOf(item)}</Text>
          <AdminStatusBadge status={item.status} />
        </View>
        {!!item.category && <Text style={styles.cardSub}>{String(item.category)}</Text>}
        <Text style={styles.cardMeta}>
          Updated {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "—"}
          {item.verificationStatus ? `  •  ${item.verificationStatus}` : ""}
        </Text>
      </TouchableOpacity>
      {(canPublish || canDelete || canEdit) && (
        <View style={styles.actionRow}>
          {canPublish && !!meta?.supportsPublish && item.status === "published" && (
            <TouchableOpacity style={styles.chip} onPress={() => applyAction(item, "unpublish")}>
              <Ionicons name="eye-off-outline" size={14} color="#F59E0B" />
              <Text style={[styles.chipText, { color: "#F59E0B" }]}>Unpublish</Text>
            </TouchableOpacity>
          )}
          {canPublish && !!meta?.supportsPublish && item.status !== "published" && (
            <TouchableOpacity style={styles.chip} onPress={() => applyAction(item, "publish")}>
              <Ionicons name="eye-outline" size={14} color="#10B981" />
              <Text style={[styles.chipText, { color: "#10B981" }]}>Publish</Text>
            </TouchableOpacity>
          )}
          {canEdit && (
            <TouchableOpacity style={styles.chip}
              onPress={() => router.push(`/admin/cms/${moduleKey}/${item._id}` as any)}>
              <Ionicons name="create-outline" size={14} color="#B58D3D" />
              <Text style={[styles.chipText, { color: "#B58D3D" }]}>Edit</Text>
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity style={styles.chip} onPress={() => setConfirmTarget(item)}>
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
              <Text style={[styles.chipText, { color: "#EF4444" }]}>
                {meta?.deletePolicy === "hard" ? "Delete" : "Archive"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <AdminHeader
        title={meta?.label || String(moduleKey)}
        subtitle={`${pagination.total} record${pagination.total === 1 ? "" : "s"}`}
        showBack
        rightAction={
          canCreate
            ? { icon: "add-circle-outline", onPress: () => router.push(`/admin/cms/${moduleKey}/new` as any) }
            : undefined
        }
      />
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={`Search ${meta?.label || ""}...`} />
        {meta?.filterFields?.includes("status") && (
          <View style={styles.filterRow}>
            {STATUS_FILTERS.map((s) => (
              <TouchableOpacity key={s || "all"}
                style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
                onPress={() => setStatusFilter(s)}>
                <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>
                  {s || "All"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : loading && !items.length ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#B58D3D" />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="folder-open-outline" size={44} color="#475569" />
          <Text style={styles.emptyText}>No records found</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(pagination.page); }} tintColor="#B58D3D" />
          }
          ListFooterComponent={
            <View style={styles.pager}>
              <TouchableOpacity disabled={pagination.page <= 1}
                style={[styles.pageBtn, pagination.page <= 1 && { opacity: 0.3 }]}
                onPress={() => fetchData(pagination.page - 1)}>
                <Ionicons name="chevron-back" size={18} color="#B58D3D" />
                <Text style={styles.pageText}>Prev</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>Page {pagination.page} / {pagination.totalPages}</Text>
              <TouchableOpacity disabled={pagination.page >= pagination.totalPages}
                style={[styles.pageBtn, pagination.page >= pagination.totalPages && { opacity: 0.3 }]}
                onPress={() => fetchData(pagination.page + 1)}>
                <Text style={styles.pageText}>Next</Text>
                <Ionicons name="chevron-forward" size={18} color="#B58D3D" />
              </TouchableOpacity>
            </View>
          }
        />
      )}
      <AdminConfirmDialog
        visible={!!confirmTarget}
        title={meta?.deletePolicy === "hard" ? "Delete record?" : "Archive record?"}
        message={
          meta?.deletePolicy === "hard"
            ? `"${confirmTarget ? titleOf(confirmTarget) : ""}" will be permanently deleted. This cannot be undone.`
            : `"${confirmTarget ? titleOf(confirmTarget) : ""}" will be archived and hidden from users. Legal data is preserved.`
        }
        confirmLabel={meta?.deletePolicy === "hard" ? "Delete" : "Archive"}
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  filterRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: "rgba(148,163,184,0.3)",
  },
  filterChipActive: { borderColor: "#B58D3D", backgroundColor: "rgba(181,141,61,0.15)" },
  filterChipText: { color: "#94A3B8", fontSize: 12, fontWeight: "700" },
  filterChipTextActive: { color: "#B58D3D" },
  card: {
    backgroundColor: "rgba(18,18,20,0.6)", borderRadius: 14, borderWidth: 1,
    borderColor: "rgba(181,141,61,0.15)", padding: 14,
  },
  cardMain: {},
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "800", flex: 1 },
  cardSub: { color: "#94A3B8", fontSize: 13, fontWeight: "600", marginTop: 2 },
  cardMeta: { color: "#64748B", fontSize: 11, fontWeight: "600", marginTop: 6 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(148,163,184,0.25)",
  },
  chipText: { fontSize: 12, fontWeight: "800" },
  error: { color: "#EF4444", textAlign: "center", marginTop: 20, fontWeight: "700" },
  empty: { alignItems: "center", marginTop: 60, gap: 8 },
  emptyText: { color: "#64748B", fontWeight: "700" },
  pager: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: 8, paddingBottom: 30,
  },
  pageBtn: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 10, paddingVertical: 8 },
  pageText: { color: "#B58D3D", fontWeight: "800" },
  pageInfo: { color: "#64748B", fontWeight: "700", fontSize: 12 },
});
