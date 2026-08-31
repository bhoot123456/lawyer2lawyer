import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import GlassCard from "@/components/ui/GlassCard";
import SearchBar from "@/components/admin/SearchBar";
import {
  getAdminJudgeDirectory,
  createAdminJudgeDirectory,
  updateAdminJudgeDirectory,
  deleteAdminJudgeDirectory,
} from "@/services/adminApi";

type JudgeItem = {
  _id: string;
  courtId: string;
  courtName: string;
  courtRoom: string;
  bench?: string;
  judgeName: string;
  vcLink: string;
  meetingId: string;
  email?: string;
  displayOrder?: number;
  status?: string;
};

const DEFAULT_COURT_IDS = [
  "delhi-high-court",
  "tis-hazari-courts",
  "saket-courts",
  "rohini-courts",
  "dwarka-courts",
  "patiala-house-courts",
  "karkardooma-courts",
  "rouse-avenue-courts",
];

export default function AdminJudgeDirectoryScreen() {
  const [items, setItems] = useState<JudgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newCourtId, setNewCourtId] = useState("");
  const [newCourtName, setNewCourtName] = useState("");
  const [newCourtRoom, setNewCourtRoom] = useState("");
  const [newBench, setNewBench] = useState("");
  const [newJudgeName, setNewJudgeName] = useState("");
  const [newVcLink, setNewVcLink] = useState("");
  const [newMeetingId, setNewMeetingId] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDisplayOrder, setNewDisplayOrder] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<JudgeItem>>({});
  const [saving, setSaving] = useState(false);

  const STATUSES = useMemo(() => ["", "draft", "published", "archived"], []);

  // Court name lookup helper
  const getCourtDisplayName = (courtId: string) => {
    const map: Record<string, string> = {
      "delhi-high-court": "Delhi High Court",
      "tis-hazari-courts": "Tis Hazari Courts",
      "saket-courts": "Saket Courts",
      "rohini-courts": "Rohini Courts",
      "dwarka-courts": "Dwarka Courts",
      "patiala-house-courts": "Patiala House Courts",
      "karkardooma-courts": "Karkardooma Courts",
      "rouse-avenue-courts": "Rouse Avenue Courts",
    };
    return map[courtId] || courtId;
  };

  const fetchItems = useCallback(
    async (pg = 1) => {
      try {
        setLoading(pg === 1);
        const params: any = { page: pg, limit: 20 };
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;

        const res = await getAdminJudgeDirectory(params);
        if (res?.success && res?.data?.items) {
          if (pg === 1) setItems(res.data.items);
          else setItems((prev) => [...prev, ...res.data.items]);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error("Fetch judge directory error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter],
  );

  useFocusEffect(
    useCallback(() => {
      fetchItems(1);
    }, [fetchItems]),
  );

  const handleCreate = async () => {
    if (!newCourtId || !newCourtRoom || !newJudgeName || !newVcLink || !newMeetingId) {
      Alert.alert("Validation", "courtId, courtRoom, judgeName, vcLink and meetingId are required");
      return;
    }

    try {
      await createAdminJudgeDirectory({
        courtId: newCourtId,
        courtName: newCourtName || getCourtDisplayName(newCourtId),
        courtRoom: newCourtRoom,
        bench: newBench,
        judgeName: newJudgeName,
        vcLink: newVcLink,
        meetingId: newMeetingId,
        email: newEmail,
        displayOrder: newDisplayOrder ? parseInt(newDisplayOrder, 10) : 0,
        status: "draft",
      });
      setShowNewForm(false);
      setNewCourtId("");
      setNewCourtName("");
      setNewCourtRoom("");
      setNewBench("");
      setNewJudgeName("");
      setNewVcLink("");
      setNewMeetingId("");
      setNewEmail("");
      setNewDisplayOrder("");
      fetchItems(1);
    } catch (err) {
      Alert.alert("Error", "Failed to create judge entry");
    }
  };

  const startEditing = (item: JudgeItem) => {
    setEditingId(item._id);
    setEditForm({
      courtId: item.courtId,
      courtName: item.courtName,
      courtRoom: item.courtRoom,
      bench: item.bench || "",
      judgeName: item.judgeName,
      vcLink: item.vcLink,
      meetingId: item.meetingId,
      email: item.email || "",
      displayOrder: item.displayOrder || 0,
      status: item.status || "draft",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    if (!editForm.judgeName?.trim() || !editForm.courtRoom?.trim()) {
      Alert.alert("Validation", "judgeName and courtRoom are required");
      return;
    }
    setSaving(true);
    try {
      const res = await updateAdminJudgeDirectory(id, editForm);
      if (res?.success) {
        setItems((prev) =>
          prev.map((x) => (x._id === id ? { ...x, ...res.data } : x)),
        );
        setEditingId(null);
        setEditForm({});
        Alert.alert("Success", "Judge entry updated");
      } else {
        Alert.alert("Error", "Failed to update judge entry");
      }
    } catch (err) {
      console.error("Update judge error:", err);
      Alert.alert("Error", "Failed to update judge entry");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    setSaving(true);
    try {
      const res = await updateAdminJudgeDirectory(id, { status: "published" });
      if (res?.success) {
        setItems((prev) =>
          prev.map((x) => (x._id === id ? { ...x, ...res.data } : x)),
        );
        Alert.alert("Success", "Judge entry published");
      }
    } catch (err) {
      console.error("Publish error:", err);
      Alert.alert("Error", "Failed to publish");
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async (id: string) => {
    setSaving(true);
    try {
      const res = await updateAdminJudgeDirectory(id, { status: "draft" });
      if (res?.success) {
        setItems((prev) =>
          prev.map((x) => (x._id === id ? { ...x, ...res.data } : x)),
        );
        Alert.alert("Success", "Judge entry reverted to draft");
      }
    } catch (err) {
      console.error("Unpublish error:", err);
      Alert.alert("Error", "Failed to unpublish");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, judgeName?: string) => {
    Alert.alert(
      "Delete Judge",
      `Delete ${judgeName || "this entry"}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAdminJudgeDirectory(id);
              setItems((prev) => prev.filter((x) => x._id !== id));
            } catch (err) {
              Alert.alert("Error", "Failed to delete judge entry");
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: JudgeItem }) => {
    const isEditing = editingId === item._id;

    if (isEditing) {
      return (
        <GlassCard>
          <Text style={styles.formTitle}>Edit Judge</Text>
          <TextInput
            style={styles.input}
            value={editForm.judgeName || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, judgeName: t }))}
            placeholder="Judge Name"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={editForm.courtRoom || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, courtRoom: t }))}
            placeholder="Court Room"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={editForm.bench || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, bench: t }))}
            placeholder="Bench (e.g. Division Bench)"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={editForm.vcLink || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, vcLink: t }))}
            placeholder="VC Link URL"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={editForm.meetingId || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, meetingId: t }))}
            placeholder="Meeting ID"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={editForm.email || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, email: t }))}
            placeholder="Email (optional)"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={String(editForm.displayOrder || 0)}
            onChangeText={(t) => setEditForm((f) => ({ ...f, displayOrder: parseInt(t) || 0 }))}
            placeholder="Display order"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelEditing} disabled={saving}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createBtn, saving && { opacity: 0.5 }]}
              onPress={() => handleSave(item._id)}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#B58D3D" />
              ) : (
                <Text style={styles.createBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </GlassCard>
      );
    }

    return (
      <GlassCard>
        <View style={styles.cardRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.judgeName?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.itemTitle}>{item.judgeName}</Text>
            <Text style={styles.itemMeta} numberOfLines={1}>
              {item.courtRoom}
            </Text>
            {!!item.courtName && (
              <Text style={styles.itemMeta}>
                {item.courtName} • {item.courtId}
              </Text>
            )}
            {!!item.bench && (
              <Text style={styles.itemMeta}>Bench: {item.bench}</Text>
            )}
            {!!item.email && (
              <Text style={styles.itemMeta} numberOfLines={1}>
                {item.email}
              </Text>
            )}
            <Text
              style={[
                styles.statusBadge,
                item.status === "published"
                  ? styles.statusPublishedBadge
                  : styles.statusDraftBadge,
              ]}
            >
              {item.status || "draft"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => startEditing(item)}
          >
            <Ionicons name="pencil-outline" size={18} color="#B58D3D" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: "rgba(239, 68, 68, 0.3)" }]}
            onPress={() => handleDelete(item._id, item.judgeName)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
        <View style={styles.cardActions}>
          {item.status === "published" ? (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  borderColor: "rgba(245, 158, 11, 0.3)",
                },
              ]}
              onPress={() => handleUnpublish(item._id)}
              disabled={saving}
            >
              <Ionicons name="cloud-download-outline" size={14} color="#F59E0B" />
              <Text style={[styles.actionText, { color: "#F59E0B" }]}>Unpublish</Text>
            </TouchableOpacity>
          ) : (
            item.status !== "archived" && (
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    borderColor: "rgba(16, 185, 129, 0.3)",
                  },
                ]}
                onPress={() => handlePublish(item._id)}
                disabled={saving}
              >
                <Ionicons name="cloud-upload-outline" size={14} color="#10B981" />
                <Text style={[styles.actionText, { color: "#10B981" }]}>Publish</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Judge Directory"
        subtitle="Admin CRUD (draft/publish)"
        showBack
        rightAction={{
          icon: "add-outline" as any,
          onPress: () => setShowNewForm((v) => !v),
        }}
      />

      {showNewForm && (
        <GlassCard style={styles.newForm}>
          <Text style={styles.formTitle}>Create New Judge (Draft)</Text>

          {/* Court ID dropdown-like selector */}
          <Text style={styles.inputLabel}>Court ID *</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={DEFAULT_COURT_IDS}
            renderItem={({ item: cid }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  newCourtId === cid && styles.chipActive,
                ]}
                onPress={() => {
                  setNewCourtId(cid);
                  setNewCourtName(getCourtDisplayName(cid));
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    newCourtId === cid && styles.chipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {getCourtDisplayName(cid)}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(cid) => cid}
            style={styles.chipList}
          />

          <TextInput
            style={styles.input}
            value={newCourtRoom}
            onChangeText={setNewCourtRoom}
            placeholder="Court Room * (e.g. Court Room 1 (DB-1))"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={newBench}
            onChangeText={setNewBench}
            placeholder="Bench (e.g. Division Bench)"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={newJudgeName}
            onChangeText={setNewJudgeName}
            placeholder="Judge Name *"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={newVcLink}
            onChangeText={setNewVcLink}
            placeholder="VC Link * (e.g. https://...)"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={newMeetingId}
            onChangeText={setNewMeetingId}
            placeholder="Meeting ID * (e.g. 251 256 78821)"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="Email (optional)"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={newDisplayOrder}
            onChangeText={setNewDisplayOrder}
            placeholder="Display Order (0 = first)"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
          />

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowNewForm(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
              <Text style={styles.createBtnText}>Create Draft</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}

      <View style={styles.filterRow}>
        <View style={styles.searchWrap}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search judge, court room..."
          />
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            setPage(1);
            fetchItems(1);
          }}
        >
          <Ionicons name="search-outline" size={20} color="#B58D3D" />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilterList}
        contentContainerStyle={styles.statusFilterContent}
        data={STATUSES}
        renderItem={({ item: s }) => (
          <TouchableOpacity
            style={[
              styles.statusFilterBtn,
              statusFilter === s && styles.statusFilterActive,
            ]}
            onPress={() => {
              setStatusFilter(s);
              setPage(1);
              fetchItems(1);
            }}
          >
            <Text
              style={[
                styles.statusFilterText,
                statusFilter === s && styles.statusFilterTextActive,
              ]}
            >
              {s || "All"}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(s) => s}
      />

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchItems(1);
            }}
            tintColor="#B58D3D"
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#B58D3D" />
            </View>
          ) : (
            <View style={styles.center}>
              <Ionicons name="people-outline" size={48} color="#64748B" />
              <Text style={styles.emptyText}>No judge entries found</Text>
              <Text style={styles.emptyHint}>
                Create a new judge entry using the + button above
              </Text>
            </View>
          )
        }
        onEndReached={() => {
          if (page < totalPages) {
            const np = page + 1;
            setPage(np);
            fetchItems(np);
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    alignItems: "center",
  },
  searchWrap: { flex: 1 },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(181, 141, 61, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.2)",
  },
  statusFilterList: { maxHeight: 44, marginBottom: 8 },
  statusFilterContent: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  statusFilterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(18, 18, 20, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.2)",
  },
  statusFilterActive: {
    backgroundColor: "rgba(181, 141, 61, 0.15)",
    borderColor: "#B58D3D",
  },
  statusFilterText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statusFilterTextActive: { color: "#B58D3D" },
  list: { padding: 16, gap: 12, paddingBottom: 40 },

  // New form styles
  newForm: { margin: 16, gap: 12 },
  formTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "900" },
  inputLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "rgba(18, 18, 20, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.2)",
    borderRadius: 12,
    padding: 12,
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
  },
  chipList: { maxHeight: 48 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(18, 18, 20, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.2)",
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: "rgba(181, 141, 61, 0.15)",
    borderColor: "#B58D3D",
  },
  chipText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
  },
  chipTextActive: { color: "#B58D3D" },
  formActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.2)",
  },
  cancelBtnText: { color: "#94A3B8", fontWeight: "700", fontSize: 13 },
  createBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(181, 141, 61, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.3)",
  },
  createBtnText: { color: "#B58D3D", fontWeight: "800", fontSize: 13 },

  // Card styles
  cardRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(181, 141, 61, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#B58D3D", fontSize: 18, fontWeight: "900" },
  cardContent: { flex: 1 },
  itemTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "800" },
  itemMeta: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
    color: "#F59E0B",
  },
  statusPublishedBadge: { color: "#10B981" },
  statusDraftBadge: { color: "#F59E0B" },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(181, 141, 61, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.3)",
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionText: { fontSize: 12, fontWeight: "700" },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
  emptyHint: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
  },
});
