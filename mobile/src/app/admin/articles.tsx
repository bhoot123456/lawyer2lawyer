import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import GlassCard from "@/components/ui/GlassCard";
import SearchBar from "@/components/admin/SearchBar";
import { getAdminArticles, deleteAdminArticle, publishAdminArticle, unpublishAdminArticle, updateAdminArticle } from "@/services/adminApi";

export default function AdminArticlesScreen() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = useCallback(async (pg = 1, srch = search, st = statusFilter) => {
    try {
      setLoading(pg === 1);
      const params: any = { page: pg, limit: 20 };
      if (srch) params.search = srch;
      if (st) params.status = st;
      const res = await getAdminArticles(params);
      if (res?.success && res?.data) {
        if (pg === 1) setArticles(res.data.articles);
        else setArticles((prev) => [...prev, ...res.data.articles]);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Fetch articles error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchArticles(1); }, []));

  const handlePublish = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === "published") {
        await unpublishAdminArticle(id);
      } else {
        await publishAdminArticle(id);
      }
      fetchArticles(1);
    } catch (err) {
      Alert.alert("Error", "Failed to update article status");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Article", "Delete this article? Cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try { await deleteAdminArticle(id); setArticles((prev) => prev.filter((a) => a._id !== id)); }
        catch (err) { Alert.alert("Error", "Failed to delete article"); }
      }},
    ]);
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      await updateAdminArticle(id, { isFeatured: !current });
      fetchArticles(1);
    } catch (err) {
      Alert.alert("Error", "Failed to update article");
    }
  };

  const renderArticle = ({ item }: { item: any }) => (
    <GlassCard>
      <View style={styles.cardHeader}>
        <View style={styles.cardContent}>
          <Text style={styles.articleTitle}>{item.title}</Text>
          <Text style={styles.articleExcerpt} numberOfLines={2}>{item.excerpt || item.content?.substring(0, 100)}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.badge, {
              backgroundColor: item.status === "published" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
              borderColor: item.status === "published" ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)",
            }]}>
              <Text style={[styles.badgeText, { color: item.status === "published" ? "#10B981" : "#F59E0B" }]}>{item.status}</Text>
            </View>
            <Text style={styles.categoryText}>{item.category}</Text>
            {item.isFeatured && (
              <View style={[styles.badge, { backgroundColor: "rgba(139, 92, 246, 0.15)", borderColor: "rgba(139, 92, 246, 0.3)" }]}>
                <Text style={[styles.badgeText, { color: "#8B5CF6" }]}>Featured</Text>
              </View>
            )}
          </View>
          <Text style={styles.metaText}>{item.readTime || 0} min read • {item.views || 0} views</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "rgba(59, 130, 246, 0.15)", borderColor: "rgba(59, 130, 246, 0.3)" }]}
          onPress={() => router.push(`/admin/articles/${item._id}` as any)}>
          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
          <Text style={[styles.actionText, { color: "#3B82F6" }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: item.status === "published" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)", borderColor: "rgba(181, 141, 61, 0.2)" }]}
          onPress={() => handlePublish(item._id, item.status)}>
          <Ionicons name={item.status === "published" ? "eye-off-outline" : "eye-outline"} size={16} color={item.status === "published" ? "#F59E0B" : "#10B981"} />
          <Text style={[styles.actionText, { color: item.status === "published" ? "#F59E0B" : "#10B981" }]}>{item.status === "published" ? "Unpublish" : "Publish"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "rgba(139, 92, 246, 0.15)", borderColor: "rgba(139, 92, 246, 0.3)" }]}
          onPress={() => handleToggleFeatured(item._id, item.isFeatured)}>
          <Ionicons name={item.isFeatured ? "star" : "star-outline"} size={16} color="#8B5CF6" />
          <Text style={[styles.actionText, { color: "#8B5CF6" }]}>{item.isFeatured ? "Unfeature" : "Feature"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "rgba(239, 68, 68, 0.3)" }]}
          onPress={() => handleDelete(item._id)}>
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionText, { color: "#EF4444" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  const handleCreateArticle = async () => {
    if (!newTitle || !newContent || !newCategory) {
      Alert.alert("Validation", "Title, content, and category are required");
      return;
    }
    try {
      const { createAdminArticle } = await import("@/services/adminApi");
      await createAdminArticle({ title: newTitle, content: newContent, category: newCategory, status: "draft" });
      setShowNewForm(false);
      setNewTitle("");
      setNewContent("");
      setNewCategory("");
      fetchArticles(1);
    } catch (err) {
      Alert.alert("Error", "Failed to create article");
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader title="Articles Management" subtitle="Create, publish, and manage articles" showBack
        rightAction={{ icon: "add-outline", onPress: () => setShowNewForm(!showNewForm) }}
      />

      {showNewForm && (
        <GlassCard style={styles.newForm}>
          <Text style={styles.formTitle}>Create New Article</Text>
          <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="Article title" placeholderTextColor="#64748B" />
          <TextInput style={styles.input} value={newCategory} onChangeText={setNewCategory} placeholder="Category" placeholderTextColor="#64748B" />
          <TextInput style={[styles.input, styles.textArea]} value={newContent} onChangeText={setNewContent} placeholder="Article content..." placeholderTextColor="#64748B" multiline numberOfLines={4} />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNewForm(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreateArticle}>
              <Text style={styles.createBtnText}>Create Draft</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}

      <View style={styles.filterRow}>
        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search articles..." />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => { setPage(1); fetchArticles(1, search, statusFilter); }}>
          <Ionicons name="search-outline" size={20} color="#B58D3D" />
        </TouchableOpacity>
      </View>

      <FlatList horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilterList} contentContainerStyle={styles.statusFilterContent} data={["", "draft", "published", "archived"]}
        renderItem={({ item: s }) => (
          <TouchableOpacity style={[styles.statusFilterBtn, statusFilter === s && styles.statusFilterActive]}
            onPress={() => { setStatusFilter(s); setPage(1); fetchArticles(1, search, s); }}>
            <Text style={[styles.statusFilterText, statusFilter === s && styles.statusFilterTextActive]}>{s || "All"}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(s) => s}
      />
      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchArticles(1); }} tintColor="#B58D3D" />}
        ListEmptyComponent={loading ? <View style={styles.center}><ActivityIndicator size="large" color="#B58D3D" /></View> :
          <View style={styles.center}><Ionicons name="newspaper-outline" size={48} color="#64748B" /><Text style={styles.emptyText}>No articles found</Text></View>}
        onEndReached={() => { if (page < totalPages) { const np = page + 1; setPage(np); fetchArticles(np, search, statusFilter); } }}
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
  textArea: { minHeight: 100, textAlignVertical: "top" },
  formActions: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.2)" },
  cancelBtnText: { color: "#94A3B8", fontWeight: "700", fontSize: 13 },
  createBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: "rgba(181, 141, 61, 0.15)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.3)" },
  createBtnText: { color: "#B58D3D", fontWeight: "800", fontSize: 13 },
  cardHeader: { flexDirection: "row", gap: 12 },
  cardContent: { flex: 1 },
  articleTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "800" },
  articleExcerpt: { color: "#94A3B8", fontSize: 12, fontWeight: "500", marginTop: 4 },
  metaRow: { flexDirection: "row", gap: 6, marginTop: 8, alignItems: "center" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  categoryText: { color: "#64748B", fontSize: 11, fontWeight: "600" },
  metaText: { color: "#64748B", fontSize: 11, fontWeight: "500", marginTop: 4 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  actionText: { fontSize: 12, fontWeight: "700" },
  emptyText: { color: "#64748B", fontSize: 14, fontWeight: "600", marginTop: 12 },
});