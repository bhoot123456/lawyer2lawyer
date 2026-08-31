import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import GlassCard from "@/components/ui/GlassCard";
import SearchBar from "@/components/admin/SearchBar";
import { getAdminLawyers, verifyLawyer, deleteAdminLawyer } from "@/services/adminApi";

export default function AdminLawyersScreen() {
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchLawyers = useCallback(async (pg = 1, srch = search, status = filterStatus) => {
    try {
      setLoading(pg === 1);
      const params: any = { page: pg, limit: 20 };
      if (srch) params.search = srch;
      if (status) params.verificationStatus = status;
      const res = await getAdminLawyers(params);
      if (res?.success && res?.data) {
        if (pg === 1) {
          setLawyers(res.data.lawyers);
        } else {
          setLawyers((prev) => [...prev, ...res.data.lawyers]);
        }
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Fetch lawyers error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLawyers(1);
    }, []),
  );

  const handleSearch = () => {
    setPage(1);
    fetchLawyers(1, search, filterStatus);
  };

  const handleVerify = (id: string, status: string) => {
    Alert.alert(
      status === "verified" ? "Verify Lawyer" : "Reject Lawyer",
      status === "verified"
        ? "Are you sure you want to verify this lawyer?"
        : "Are you sure you want to reject this lawyer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await verifyLawyer(id, status);
              fetchLawyers(1);
            } catch (err) {
              Alert.alert("Error", "Failed to verify lawyer");
            }
          },
        },
      ],
    );
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Lawyer", `Are you sure you want to delete ${name}? This action cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAdminLawyer(id);
            setLawyers((prev) => prev.filter((l) => l._id !== id));
          } catch (err) {
            Alert.alert("Error", "Failed to delete lawyer");
          }
        },
      },
    ]);
  };

  const renderLawyer = ({ item, index }: { item: any; index: number }) => (
    <GlassCard style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardEmail}>{item.email}</Text>
          <Text style={styles.cardMeta}>
            {item.specialization} • {item.city}, {item.state}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.verificationStatus === "verified"
                  ? "rgba(16, 185, 129, 0.15)"
                  : item.verificationStatus === "rejected"
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(245, 158, 11, 0.15)",
              borderColor:
                item.verificationStatus === "verified"
                  ? "rgba(16, 185, 129, 0.3)"
                  : item.verificationStatus === "rejected"
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(245, 158, 11, 0.3)",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.verificationStatus === "verified"
                    ? "#10B981"
                    : item.verificationStatus === "rejected"
                    ? "#EF4444"
                    : "#F59E0B",
              },
            ]}
          >
            {item.verificationStatus}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        {item.verificationStatus === "pending" && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.3)" }]}
              onPress={() => handleVerify(item._id, "verified")}
            >
              <Ionicons name="checkmark-outline" size={16} color="#10B981" />
              <Text style={[styles.actionText, { color: "#10B981" }]}>Verify</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "rgba(239, 68, 68, 0.3)" }]}
              onPress={() => handleVerify(item._id, "rejected")}
            >
              <Ionicons name="close-outline" size={16} color="#EF4444" />
              <Text style={[styles.actionText, { color: "#EF4444" }]}>Reject</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "rgba(59, 130, 246, 0.15)", borderColor: "rgba(59, 130, 246, 0.3)" }]}
          onPress={() => router.push(`/admin/lawyers/${item._id}` as any)}
        >
          <Ionicons name="eye-outline" size={16} color="#3B82F6" />
          <Text style={[styles.actionText, { color: "#3B82F6" }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "rgba(239, 68, 68, 0.3)" }]}
          onPress={() => handleDelete(item._id, item.name)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionText, { color: "#EF4444" }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Details */}
      <View style={styles.detailsRow}>
        {item.barCouncilNumber && (
          <Text style={styles.detailText}>Bar #: {item.barCouncilNumber}</Text>
        )}
        {item.experience !== undefined && (
          <Text style={styles.detailText}>Exp: {item.experience} yrs</Text>
        )}
        {item.phone && <Text style={styles.detailText}>📞 {item.phone}</Text>}
      </View>
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      <AdminHeader title="Lawyers Management" subtitle="Approve, verify, and manage lawyers" showBack />

      <View style={styles.filterRow}>
        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search lawyers..." />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={handleSearch}>
          <Ionicons name="search-outline" size={20} color="#B58D3D" />
        </TouchableOpacity>
      </View>

      <View style={styles.statusFilters}>
        {["", "pending", "verified", "rejected"].map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.statusFilterBtn,
              filterStatus === s && styles.statusFilterActive,
            ]}
            onPress={() => {
              setFilterStatus(s);
              setPage(1);
              fetchLawyers(1, search, s);
            }}
          >
            <Text
              style={[
                styles.statusFilterText,
                filterStatus === s && styles.statusFilterTextActive,
              ]}
            >
              {s || "All"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={lawyers}
        renderItem={renderLawyer}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLawyers(1); }} tintColor="#B58D3D" />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#B58D3D" />
            </View>
          ) : (
            <View style={styles.center}>
              <Ionicons name="people-outline" size={48} color="#64748B" />
              <Text style={styles.emptyText}>No lawyers found</Text>
            </View>
          )
        }
        onEndReached={() => {
          if (page < totalPages) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchLawyers(nextPage, search, filterStatus);
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
  statusFilters: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  statusFilterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(18, 18, 20, 0.6)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.2)" },
  statusFilterActive: { backgroundColor: "rgba(181, 141, 61, 0.15)", borderColor: "#B58D3D" },
  statusFilterText: { color: "#94A3B8", fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  statusFilterTextActive: { color: "#B58D3D" },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { marginBottom: 0 },
  cardRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(181, 141, 61, 0.15)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#B58D3D", fontSize: 18, fontWeight: "900" },
  cardContent: { flex: 1 },
  cardName: { color: "#F8FAFC", fontSize: 15, fontWeight: "800" },
  cardEmail: { color: "#64748B", fontSize: 12, fontWeight: "500" },
  cardMeta: { color: "#94A3B8", fontSize: 11, fontWeight: "600", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: "800", textTransform: "capitalize" },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  actionText: { fontSize: 12, fontWeight: "700" },
  detailsRow: { flexDirection: "row", gap: 12, marginTop: 8, flexWrap: "wrap" },
  detailText: { color: "#94A3B8", fontSize: 11, fontWeight: "600" },
  emptyText: { color: "#64748B", fontSize: 14, fontWeight: "600", marginTop: 12 },
});