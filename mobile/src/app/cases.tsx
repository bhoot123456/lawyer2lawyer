import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import CaseSearchFilters from "@/components/cases/CaseSearchFilters";
import { getCases } from "@/services/caseApi";

import { Ionicons } from "@expo/vector-icons";

export default function CasesPage() {
  const [query, setQuery] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  const load = async (q: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCases({ query: q });
      setItems(Array.isArray(data?.cases) ? data.cases : []);
      setTotal(Number(data?.total ?? 0));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Unable to fetch cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await load({});
    };
    initialize();
     
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CaseSearchFilters initialQuery={query} onChange={setQuery} />

      <View style={styles.headerRow}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text style={styles.title}>Cases</Text>
          <Text style={styles.count}>{total} total</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => router.push("/cases/new" as any)}>
          <Ionicons name="add" size={16} color="#0B0B0B" />
          <Text style={styles.addBtnText}>Add Case</Text>
        </Pressable>
      </View>

      <Pressable style={styles.refreshBtn} onPress={() => load(query)}>
        <Ionicons name="refresh-outline" size={16} color="#D4AF37" />
        <Text style={styles.refreshText}>Search</Text>
      </Pressable>

      {loading && <ActivityIndicator size="small" color="#B58D3D" />}
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && !error && items.length === 0 && (
        <Text style={styles.empty}>No cases found.</Text>
      )}

      {!loading && items.length > 0 && (
        <View style={styles.list}>
          {items.map((c) => (
            <Pressable
              key={c._id}
              style={styles.card}
              onPress={() => router.push(`/cases/${c._id}` as any)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.caseTitle} numberOfLines={1}>
                  {c.caseTitle || "Untitled"}
                </Text>
                <Text style={styles.caseStatus}>{c.status || ""}</Text>
              </View>
              <Text style={styles.caseMeta}>Case #{c.caseNumber}</Text>
              <Text style={styles.caseMeta}>Client: {c.client}</Text>
              <Text style={styles.caseMeta}>Next: {c.nextHearingDate ? String(c.nextHearingDate).slice(0,10) : "-"}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "900",
  },
  count: {
    color: "rgba(181, 141, 61, 0.9)",
    fontWeight: "800",
    fontSize: 12,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4AF37",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: {
    color: "#0B0B0B",
    fontWeight: "900",
    fontSize: 12,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(181, 141, 61, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.55)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  refreshText: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 14,
  },
  error: {
    color: "#f87171",
    fontWeight: "800",
  },
  empty: {
    color: "rgba(248, 250, 252, 0.75)",
    fontWeight: "700",
  },
  list: {
    gap: 10,
    marginTop: 6,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.20)",
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  caseTitle: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 14,
    flex: 1,
  },
  caseStatus: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 12,
    maxWidth: 120,
  },
  caseMeta: {
    color: "rgba(248, 250, 252, 0.78)",
    fontWeight: "700",
    fontSize: 12,
  },
});

