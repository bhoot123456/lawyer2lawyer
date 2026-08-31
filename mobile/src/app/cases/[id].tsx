import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getCaseById } from "@/services/caseApi";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";

export default function CaseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseDoc, setCaseDoc] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getCaseById(id);
        // Backend contract: GET /api/cases/:id -> { success, case }
        setCaseDoc(res?.case ?? res);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || "Unable to fetch case");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const nextHearing = caseDoc?.nextHearingDate ? String(caseDoc.nextHearingDate).slice(0, 10) : "-";

  const handleDelete = () => {
    Alert.alert("Delete Case", "Are you sure you want to delete this case? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        setLoading(true);
        try {
          await api.delete(`/cases/${id}`);
          router.replace("/cases");
        } catch (e: any) {
          setError(e?.response?.data?.message || e?.message || "Failed to delete");
          setLoading(false);
        }
      }}
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading && <ActivityIndicator size="small" color="#B58D3D" />}
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && caseDoc && (
        <>
          <View style={styles.headerCard}>
            <Text style={styles.title}>{caseDoc.caseTitle || "Untitled"}</Text>
            <Text style={styles.caseNo}>Case #{caseDoc.caseNumber}</Text>
            <Text style={styles.sub}>Client: {caseDoc.client || "-"}</Text>
            <Text style={styles.sub}>Status: {caseDoc.status || "-"}</Text>
            <Text style={styles.sub}>Next hearing: {nextHearing}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={() => router.push(`/cases/${id}/timeline` as any)}>
              <Ionicons name="time-outline" size={18} color="#D4AF37" />
              <Text style={styles.actionText}>Timeline</Text>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={() => router.push(`/cases/${id}/documents` as any)}>
              <Ionicons name="document-text-outline" size={18} color="#D4AF37" />
              <Text style={styles.actionText}>Documents</Text>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={() => router.push(`/cases/${id}/expenses` as any)}>
              <Ionicons name="cash-outline" size={18} color="#D4AF37" />
              <Text style={styles.actionText}>Expenses</Text>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={() => router.push(`/cases/${id}/notes` as any)}>
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

          <Pressable style={styles.editBtn} onPress={() => router.push(`/cases/${id}/edit` as any)}>
            <Text style={styles.editText}>Edit Case</Text>
          </Pressable>

          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={styles.deleteText}>Delete Case</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 110,
    backgroundColor: "#0B0B0B",
  },
  headerCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.20)",
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  title: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 18,
  },
  caseNo: {
    color: "#D4AF37",
    fontWeight: "900",
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
    backgroundColor: "rgba(181, 141, 61, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.35)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionText: {
    color: "#F8FAFC",
    fontWeight: "900",
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.18)",
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontWeight: "900",
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
    fontWeight: "900",
  },
  editBtn: {
    backgroundColor: "rgba(181, 141, 61, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.55)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  editText: {
    color: "#D4AF37",
    fontWeight: "900",
  },
  deleteBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  deleteText: {
    color: "#ef4444",
    fontWeight: "900",
  },
  error: {
    color: "#f87171",
    fontWeight: "800",
  },
});

