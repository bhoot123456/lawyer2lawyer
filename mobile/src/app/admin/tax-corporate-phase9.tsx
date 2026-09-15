import React, { useCallback, useMemo, useState } from "react";
import { colors } from "@/theme/designSystem";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AdminHeader from "@/components/admin/AdminHeader";
import GlassCard from "@/components/ui/GlassCard";
import SearchBar from "@/components/admin/SearchBar";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";

import {
  getAdminTaxCorporatePhase9,
  createAdminTaxCorporatePhase9,
  updateAdminTaxCorporatePhase9,
  deleteAdminTaxCorporatePhase9,
} from "@/services/adminApi";

type Item = {
  _id: string;
  title: string;
  key?: string;
  topic?: string;
  status?: string;
};

export default function AdminTaxCorporatePhase9Screen() {
  const [items, setItems] = useState<Item[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newContent, setNewContent] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Item>>({});
  const [saving, setSaving] = useState(false);
  // Cross-platform confirm/notice dialogs (Alert.alert is a no-op on web).
  const { confirm: confirmDialog, notice: noticeDialog, element: dialogElement } = useConfirmDialog();

  const STATUSES = useMemo(() => ["", "draft", "published", "archived"], []);

  const fetchItems = useCallback(
    async (pg = 1) => {
      try {
        setLoading(pg === 1);
        const params: any = { page: pg, limit: 20 };
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;

        const res = await getAdminTaxCorporatePhase9(params);
        if (res?.success && res?.data?.items) {
          if (pg === 1) setItems(res.data.items);
          else setItems((prev) => [...prev, ...res.data.items]);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error("Fetch tax corporate phase9 error:", err);
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

  const startEditing = (item: Item) => {
    setEditingId(item._id);
    setEditForm({
      title: item.title,
      key: item.key || "",
      topic: item.topic || "",
      status: item.status || "draft",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    if (!editForm.title?.trim() || !editForm.key?.trim()) {
      void noticeDialog({ title: "Missing information", message: "Title and Key are required", danger: true });
      return;
    }
    setSaving(true);
    try {
      const res = await updateAdminTaxCorporatePhase9(id, editForm);
      if (res?.success) {
        setItems((prev) =>
          prev.map((x) => (x._id === id ? { ...x, ...res.data } : x)),
        );
        setEditingId(null);
        setEditForm({});
        void noticeDialog({ title: "Saved", message: "Item updated" });
      } else {
        void noticeDialog({ title: "Error", message: "Failed to update item", danger: true });
      }
    } catch (err) {
      console.error("Update item error:", err);
      void noticeDialog({ title: "Error", message: "Failed to update item", danger: true });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    setSaving(true);
    try {
      const res = await updateAdminTaxCorporatePhase9(id, { status: "published" });
      if (res?.success) {
        setItems((prev) =>
          prev.map((x) => (x._id === id ? { ...x, ...res.data } : x)),
        );
        void noticeDialog({ title: "Published", message: "Item published" });
      }
    } catch (err) {
      console.error("Publish error:", err);
      void noticeDialog({ title: "Error", message: "Failed to publish", danger: true });
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async (id: string) => {
    setSaving(true);
    try {
      const res = await updateAdminTaxCorporatePhase9(id, { status: "draft" });
      if (res?.success) {
        setItems((prev) =>
          prev.map((x) => (x._id === id ? { ...x, ...res.data } : x)),
        );
        void noticeDialog({ title: "Reverted", message: "Item reverted to draft" });
      }
    } catch (err) {
      console.error("Unpublish error:", err);
      void noticeDialog({ title: "Error", message: "Failed to unpublish", danger: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, title?: string) => {
    void (async () => {
      // Shared ConfirmDialog renders on web too (RN Alert.alert is a no-op there).
      const ok = await confirmDialog({
        title: "Delete Item",
        message: `Delete ${title || "this item"}? This cannot be undone.`,
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok) return;
      try {
        await deleteAdminTaxCorporatePhase9(id);
        setItems((prev) => prev.filter((x) => x._id !== id));
      } catch (err) {
        void noticeDialog({ title: "Error", message: "Failed to delete item", danger: true });
      }
    })();
  };

  const handleCreate = async () => {
    if (!newTitle || !newKey) {
      void noticeDialog({ title: "Missing information", message: "Title and Key are required", danger: true });
      return;
    }

    try {
      await createAdminTaxCorporatePhase9({
        title: newTitle,
        key: newKey,
        topic: newTopic,
        content: newContent,
        status: "draft",
      });

      setShowNewForm(false);
      setNewTitle("");
      setNewKey("");
      setNewTopic("");
      setNewContent("");
      fetchItems(1);
    } catch (err) {
      void noticeDialog({ title: "Error", message: "Failed to create item", danger: true });
    }
  };

  const renderItem = ({ item }: { item: Item }) => {
    const isEditing = editingId === item._id;

    if (isEditing) {
      return (
        <GlassCard>
          <Text style={styles.formTitle}>Edit Item</Text>
          <TextInput
            style={styles.input}
            value={editForm.title || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, title: t }))}
            placeholder="Title"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={editForm.key || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, key: t }))}
            placeholder="Key"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={editForm.topic || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, topic: t }))}
            placeholder="Topic"
            placeholderTextColor="#64748B"
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
                <ActivityIndicator size="small" color={colors.accent.gold} />
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
        <View style={styles.cardActionsRow}>
          <View style={styles.cardContent}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {!!item.topic && <Text style={styles.itemMeta}>Topic: {item.topic}</Text>}
            {!!item.key && <Text style={styles.itemMeta}>Key: {item.key}</Text>}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      item.status === "published"
                        ? "rgba(16, 185, 129, 0.15)"
                        : "rgba(245, 158, 11, 0.15)",
                    borderColor:
                      item.status === "published"
                        ? "rgba(16, 185, 129, 0.3)"
                        : "rgba(245, 158, 11, 0.3)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    { color: item.status === "published" ? "#10B981" : "#F59E0B" },
                  ]}
                >
                  {item.status || "draft"}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => startEditing(item)}>
            <Ionicons name="pencil-outline" size={18} color={colors.accent.gold} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { borderColor: "rgba(239, 68, 68, 0.3)" }]}
            onPress={() => handleDelete(item._id, item.title)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
        <View style={styles.cardActions}>
          {item.status === "published" ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "rgba(245, 158, 11, 0.15)", borderColor: "rgba(245, 158, 11, 0.3)" }]}
              onPress={() => handleUnpublish(item._id)}
              disabled={saving}
            >
              <Ionicons name="cloud-download-outline" size={14} color="#F59E0B" />
              <Text style={[styles.actionText, { color: "#F59E0B" }]}>Unpublish</Text>
            </TouchableOpacity>
          ) : (
            item.status !== "archived" && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.3)" }]}
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
        title="Tax & Corporate (Phase 9)"
        subtitle="Admin CRUD (draft/publish)"
        showBack
        rightAction={{
          icon: "add-outline" as any,
          onPress: () => setShowNewForm((v) => !v),
        }}
      />

      {showNewForm && (
        <GlassCard style={styles.newForm}>
          <Text style={styles.formTitle}>Create New (Draft)</Text>

          <TextInput
            style={styles.input}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Title"
            placeholderTextColor="#64748B"
          />

          <TextInput
            style={styles.input}
            value={newKey}
            onChangeText={setNewKey}
            placeholder="Key"
            placeholderTextColor="#64748B"
          />

          <TextInput
            style={styles.input}
            value={newTopic}
            onChangeText={setNewTopic}
            placeholder="Topic (optional)"
            placeholderTextColor="#64748B"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            value={newContent}
            onChangeText={setNewContent}
            placeholder="Content"
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={4}
          />

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNewForm(false)}>
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
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search..." />
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            setPage(1);
            fetchItems(1);
          }}
        >
          <Ionicons name="search-outline" size={20} color={colors.accent.gold} />
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
            style={[styles.statusFilterBtn, statusFilter === s && styles.statusFilterActive]}
            onPress={() => {
              setStatusFilter(s);
              setPage(1);
              fetchItems(1);
            }}
          >
            <Text
              style={[styles.statusFilterText, statusFilter === s && styles.statusFilterTextActive]}
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
            tintColor={colors.accent.gold}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.accent.gold} />
            </View>
          ) : (
            <View style={styles.center}>
              <Ionicons name="book-outline" size={48} color="#64748B" />
              <Text style={styles.emptyText}>No items found</Text>
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
      {dialogElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },

  filterRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: "center" },
  searchWrap: { flex: 1 },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
  },

  statusFilterList: { maxHeight: 44, marginBottom: 8 },
  statusFilterContent: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  statusFilterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(18, 18, 20, 0.6)",
    borderWidth: 1,
    borderColor: colors.border.goldLight,
  },
  statusFilterActive: { backgroundColor: colors.accent.goldLight, borderColor: colors.accent.gold },
  statusFilterText: { color: "#94A3B8", fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  statusFilterTextActive: { color: colors.accent.gold },

  list: { padding: 16, gap: 12, paddingBottom: 40 },

  newForm: { margin: 16, gap: 12 },
  formTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "800" },

  input: {
    backgroundColor: "rgba(18, 18, 20, 0.7)",
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    borderRadius: 12,
    padding: 12,
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
  },
  textArea: { minHeight: 110, textAlignVertical: "top" },

  formActions: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border.goldLight },
  cancelBtnText: { color: "#94A3B8", fontWeight: "700", fontSize: 13 },
  createBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.accent.goldLight, borderWidth: 1, borderColor: colors.border.gold },
  createBtnText: { color: colors.accent.gold, fontWeight: "800", fontSize: 13 },

  cardHeader: { flexDirection: "row", gap: 12 },
  cardContent: { flex: 1 },
  itemTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "800" },
  itemMeta: { color: "#94A3B8", fontSize: 12, fontWeight: "600", marginTop: 4 },

  statusRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: "800", textTransform: "capitalize" },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  statusPillText: { fontSize: 12, fontWeight: "800", textTransform: "capitalize" },
  cardActionsRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.accent.goldSubtle, borderWidth: 1, borderColor: colors.border.gold },

  cardActions: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  actionText: { fontSize: 12, fontWeight: "700" },

  emptyText: { color: "#64748B", fontSize: 14, fontWeight: "600", marginTop: 12 },
});

