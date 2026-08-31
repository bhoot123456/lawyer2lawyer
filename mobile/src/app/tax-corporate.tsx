import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import GlassCard from "@/components/ui/GlassCard";
import { getTaxCorporatePhase9 } from "@/services/taxCorporateApi";

type Topic = {
  key: string;
  title: string;
};

export default function TaxCorporateScreen() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getTaxCorporatePhase9();
        setData(res);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const topics: Topic[] = useMemo(() => data?.topics || [], [data]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GlassCard borderColor="rgba(181, 141, 61, 0.35)" accent="#B58D3D">
        <View style={styles.headerRow}>
          <View style={styles.badgeIcon}>
            <Ionicons name="briefcase-outline" size={20} color="#D4AF37" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Tax & Corporate • Phase 9</Text>
            <Text style={styles.subtitle}>
              Income Tax • GST • Customs • Corporate Law • Company Law • ROC •
              Trademark • Startup Registration
            </Text>
          </View>
        </View>

        {data?.lastUpdatedNote ? (
          <View style={styles.noteBox}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#B58D3D"
            />
            <Text style={styles.noteText}>{data.lastUpdatedNote}</Text>
          </View>
        ) : null}
      </GlassCard>

      <Text style={styles.sectionHeader}>Topics</Text>

      {loading ? (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator size="small" color="#B58D3D" />
        </View>
      ) : null}

      <View style={styles.cards}>
        {topics.map((t) => (
          <Pressable
            key={t.key}
            style={({ pressed }) => [styles.card, pressed ? { opacity: 0.92 } : null]}
            onPress={() => router.push(`/tax-corporate/${t.key}` as any)}
          >
            <Text style={styles.cardTitle}>{t.title}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardHint}>Open procedure & docs</Text>
              <Ionicons name="chevron-forward" size={18} color="#B58D3D" />
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 18 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 110,
    backgroundColor: "#0B0B0B",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(181,141,61,0.12)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(248,250,252,0.75)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
    lineHeight: 16,
  },
  noteBox: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.20)",
    backgroundColor: "rgba(181,141,61,0.08)",
    borderRadius: 14,
    padding: 10,
  },
  noteText: {
    color: "rgba(248,250,252,0.8)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    flex: 1,
  },
  sectionHeader: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  cards: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.20)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  cardTitle: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 15,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  cardHint: {
    color: "rgba(248,250,252,0.65)",
    fontWeight: "800",
    fontSize: 12,
  },
});

