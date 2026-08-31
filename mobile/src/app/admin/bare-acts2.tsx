import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import GlassCard from "@/components/ui/GlassCard";
import SearchBar from "@/components/admin/SearchBar";
import {
  getAdminBareActs,
  createAdminBareAct,
  updateAdminBareAct,
  deleteAdminBareAct,
} from "@/services/adminApi";

type BareActItem = {
  _id: string;
  title: string;
  actName?: string;
  sectionNumber?: string;
  jurisdiction?: string;
  language?: string;
  status?: string;
};

export default function AdminBareActsScreen() {
  const [items, setItems] = useState<BareActItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newActName, setNewActName] = useState("");
  const [newSectionNumber, setNewSectionNumber] = useState("");
  const [newJurisdiction, setNewJurisdiction] = useState("");
  const [newContent, setNewContent] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BareActItem>>({});
  const [saving, setSaving] = useState(false);

  const STATUSES = useMemo(() => ["", "draft", "published", "archived"], []);

  const fetchItems = useCallback(
    async (pg = 1) => {
      try {
        setLoading(pg === 1);
        const params: any = { page: pg, limit: 20 };
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;

        const res = await getAdminBareActs(params);
        if (res?.success && res?.data?.bareActs) {
          if (pg === 1) setItems(res.data.bareActs);
          else setItems((prev) => [...prev, ...res.data.bareActs]);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error("Fetch bare acts error:", err);
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
    if (!newTitle) {
      Alert.alert("Validation", "Title is required");
      return;
    }

    try {
      await createAdminBareAct({
        title: newTitle,
        actName: newActName,
        sectionNumber: newSectionNumber,
        jurisdiction: newJurisdiction,
        content: newContent,
        status: "draft",
      });
      setShowNewForm(false);
      setNewTitle("");
      setNewActName("");
      setNewSectionNumber("");
      setNewJurisdiction("");
      setNewContent("");
      fetchItems(1);
    } catch (err) {
      Alert.alert("Error", "Failed to create bare act");
    }
  };

  const startEditing = (item: BareActItem) => {
    setEditingId(item._id);
    setEditForm({
      title: item.title,
      actName: item.actName || "",
      sectionNumber: item.sectionNumber || "",
      jurisdiction: item.jurisdiction || "",
      status: item.status || "draft",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    if (!editForm.title?.trim()) {
      Alert.alert("Validation", "Title is required");
      return;
    }
    setSaving(true);
    try {
      const res = await updateAdminBareAct(id, editForm);
      if (res?.success) {
        setItems((prev) =>
          prev.map((x) => (x._id === id ? { ...x, ...res.data } : x)),
        );
        setEditingId(null);
        setEditForm({});
        Alert.alert("Success", "Bare act updated");
      } else {
        Alert.alert("Error", "Failed to update bare act");
      }
    } catch (err) {
      console.error("Update bare act error:", err);
      Alert.alert("Error", "Failed to update bare act");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    setSaving(true);
    try {
      const res = await updateAdminBareAct(id, { status: "published" });
      if (res?.success) {
        setItems((prev) =>
          prev.map((x) => (x._id === id ? { ...x, ...res.data } : x)),
        );
        Alert.alert("Success", "Bare act published");
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
      const res = await updateAdminBareAct(id, { status: "draft" });
      if (res?.success) {
        setItems((prev) =>
          prev.map((x) => (x._id === id ? { ...x, ...res.data } : x)),
        );
        Alert.alert("Success", "Bare act reverted to draft");
      }
    } catch (err) {
      console.error("Unpublish error:", err);
      Alert.alert("Error", "Failed to unpublish");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, title?: string) => {
    Alert.alert(
      "Delete Bare Act",
      `Delete ${title || "this item"}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAdminBareAct(id);
              setItems((prev) => prev.filter((x) => x._id !== id));
            } catch (err) {
              Alert.alert("Error", "Failed to delete");
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: BareActItem }) => {
    const isEditing = editingId === item._id;

    if (isEditing) {
      return (
        <GlassCard>
          <Text style={styles.formTitle}>Edit Bare Act</Text>
          <TextInput
            style={styles.input}
            value={editForm.title || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, title: t }))}
            placeholder="Title"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={editForm.actName || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, actName: t }))}
            placeholder="Act name"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={editForm.sectionNumber || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, sectionNumber: t }))}
            placeholder="Section number"
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.input}
            value={editForm.jurisdiction || ""}
            onChangeText={(t) => setEditForm((f) => ({ ...f, jurisdiction: t }))}
            placeholder="Jurisdiction"
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
            <Text style={styles.avatarText}>{item.title?.charAt(0)?.toUpperCase() || "?"}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemMeta} numberOfLines={1}>
              {item.actName || ""}{item.sectionNumber ? ` • ${item.sectionNumber}` : ""}
            </Text>
            {!!item.jurisdiction && (
              <Text style={styles.itemMeta}>Jurisdiction: {item.jurisdiction}</Text>
            )}
            <Text style={[styles.statusBadge, item.status === "published" ? styles.statusPublishedBadge : styles.statusDraftBadge]}>
              {item.status || "draft"}
            </Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => startEditing(item)}>
            <Ionicons name="pencil-outline" size={18} color="#B58D3D" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: "rgba(239, 68, 68, 0.3)" }]}
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
        title="Bare Acts"
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
          <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="Title" placeholderTextColor="#64748B" />
          <TextInput style={styles.input} value={newActName} onChangeText={setNewActName} placeholder="Act name" placeholderTextColor="#64748B" />
          <TextInput style={styles.input} value={newSectionNumber} onChangeText={setNewSectionNumber} placeholder="Section number" placeholderTextColor="#64748B" />
          <TextInput style={styles.input} value={newJurisdiction} onChangeText={setNewJurisdiction} placeholder="Jurisdiction (optional)" placeholderTextColor="#64748B" />
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
            style={[styles.statusFilterBtn, statusFilter === s && styles.statusFilterActive]}
            onPress={() => {
              setStatusFilter(s);
              setPage(1);
              fetchItems(1);
            }}
          >
            <Text style={[styles.statusFilterText, statusFilter === s && styles.statusFilterTextActive]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: "center" },
  searchWrap: { flex: 1 },
  filterBtn: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(181, 141, 61, 0.1)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.2)" },
  statusFilterList: { maxHeight: 44, marginBottom: 8 },
  statusFilterContent: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  statusFilterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(18, 18, 20, 0.6)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.2)" },
  statusFilterActive: { backgroundColor: "rgba(181, 141, 61, 0.15)", borderColor: "#B58D3D" },
  statusFilterText: { color: "#94A3B8", fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  statusFilterTextActive: { color: "#B58D3D" },
  list: { padding: 16, gap: 12, paddingBottom: 40 },

  newForm: { margin: 16, gap: 12 },
  formTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "900" },
  input: { backgroundColor: "rgba(18, 18, 20, 0.7)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.2)", borderRadius: 12, padding: 12, color: "#F8FAFC", fontSize: 14, fontWeight: "600" },
  textArea: { minHeight: 110, textAlignVertical: "top" },
  formActions: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.2)" },
  cancelBtnText: { color: "#94A3B8", fontWeight: "700", fontSize: 13 },
  createBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: "rgba(181, 141, 61, 0.15)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.3)" },
  createBtnText: { color: "#B58D3D", fontWeight: "800", fontSize: 13 },

  cardRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(181, 141, 61, 0.15)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#B58D3D", fontSize: 18, fontWeight: "900" },
  cardContent: { flex: 1 },
  itemTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "800" },
  itemMeta: { color: "#94A3B8", fontSize: 12, fontWeight: "600", marginTop: 4 },
  statusText: { marginTop: 8, fontSize: 11, fontWeight: "800", textTransform: "capitalize" },
  statusPublished: { color: "#10B981" },
  statusDraft: { color: "#F59E0B" },
  statusBadge: { marginTop: 8, fontSize: 11, fontWeight: "800", textTransform: "capitalize", color: "#F59E0B" },
  statusPublishedBadge: { color: "#10B981" },
  statusDraftBadge: { color: "#F59E0B" },
  editBtn: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(181, 141, 61, 0.08)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.3)" },
  deleteBtn: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239, 68, 68, 0.08)", borderWidth: 1 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  actionText: { fontSize: 12, fontWeight: "700" },
  emptyText: { color: "#64748B", fontSize: 14, fontWeight: "600", marginTop: 12 },
});

