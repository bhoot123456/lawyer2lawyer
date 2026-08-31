import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import GlassCard from "@/components/ui/GlassCard";
import SearchBar from "@/components/admin/SearchBar";
import { getAdminClients, deleteAdminClient, updateAdminClient } from "@/services/adminApi";

export default function AdminClientsScreen() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchClients = useCallback(async (pg = 1, srch = search) => {
    try {
      setLoading(pg === 1);
      const params: any = { page: pg, limit: 20 };
      if (srch) params.search = srch;
      const res = await getAdminClients(params);
      if (res?.success && res?.data) {
        if (pg === 1) setClients(res.data.clients);
        else setClients((prev) => [...prev, ...res.data.clients]);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Fetch clients error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchClients(1); }, []));

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Client", `Delete ${name}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try { await deleteAdminClient(id); setClients((prev) => prev.filter((c) => c._id !== id)); }
        catch (err) { Alert.alert("Error", "Failed to delete client"); }
      }},
    ]);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await updateAdminClient(id, { isActive: !currentStatus });
      if (res?.success) {
        setClients((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update client status");
    }
  };

  const renderClient = ({ item }: { item: any }) => (
    <GlassCard>
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || "?"}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardEmail}>{item.email}</Text>
          <Text style={styles.cardMeta}>{item.city}, {item.state}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: item.isActive ? "#10B981" : "#EF4444" }]} />
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "rgba(59, 130, 246, 0.15)", borderColor: "rgba(59, 130, 246, 0.3)" }]}
          onPress={() => router.push(`/admin/clients/${item._id}` as any)}>
          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
          <Text style={[styles.actionText, { color: "#3B82F6" }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: item.isActive ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)", borderColor: "rgba(181, 141, 61, 0.2)" }]}
          onPress={() => handleToggleActive(item._id, item.isActive)}>
          <Ionicons name={item.isActive ? "pause-outline" : "play-outline"} size={16} color={item.isActive ? "#F59E0B" : "#10B981"} />
          <Text style={[styles.actionText, { color: item.isActive ? "#F59E0B" : "#10B981" }]}>{item.isActive ? "Suspend" : "Activate"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "rgba(239, 68, 68, 0.3)" }]}
          onPress={() => handleDelete(item._id, item.name)}>
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionText, { color: "#EF4444" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      <AdminHeader title="Clients Management" subtitle="Manage client accounts" showBack />
      <View style={styles.filterRow}>
        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search clients..." />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => { setPage(1); fetchClients(1, search); }}>
          <Ionicons name="search-outline" size={20} color="#B58D3D" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={clients}
        renderItem={renderClient}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClients(1); }} tintColor="#B58D3D" />}
        ListEmptyComponent={loading ? <View style={styles.center}><ActivityIndicator size="large" color="#B58D3D" /></View> :
          <View style={styles.center}><Ionicons name="people-outline" size={48} color="#64748B" /><Text style={styles.emptyText}>No clients found</Text></View>}
        onEndReached={() => { if (page < totalPages) { const np = page + 1; setPage(np); fetchClients(np, search); } }}
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
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  cardRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(181, 141, 61, 0.15)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#B58D3D", fontSize: 18, fontWeight: "900" },
  cardContent: { flex: 1 },
  cardName: { color: "#F8FAFC", fontSize: 15, fontWeight: "800" },
  cardEmail: { color: "#64748B", fontSize: 12, fontWeight: "500" },
  cardMeta: { color: "#94A3B8", fontSize: 11, fontWeight: "600", marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  actionText: { fontSize: 12, fontWeight: "700" },
  emptyText: { color: "#64748B", fontSize: 14, fontWeight: "600", marginTop: 12 },
});