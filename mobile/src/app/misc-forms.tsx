import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SectionCard from "@/components/SectionCard";

import { api } from "@/services/api";

type MiscFormItem = {
  name?: string;
  url?: string;
};

type MiscFormCategory = {
  category?: string;
  items?: MiscFormItem[];
};

type ApiResponse = {
  categories?: MiscFormCategory[];
};

export default function MiscFormsScreen() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<MiscFormCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<ApiResponse>("/misc-forms");
        const cats = (res?.data as any)?.categories || [];
        if (mounted) setCategories(Array.isArray(cats) ? cats : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load misc forms");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const normalized = useMemo(() => {
    return categories
      .map((c) => ({
        category: c?.category,
        items: Array.isArray(c?.items) ? c.items : [],
      }))
      .filter((c) => !!c.category)
      .map((c) => ({
        ...c,
        items: (c.items || [])
          .map((i) => ({
            name: i?.name,
            url: i?.url,
          }))
          .filter((i) => !!i.name && !!i.url),
      }))
      .filter((c) => (c.items || []).length > 0);
  }, [categories]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.pageTitle}>Misc. Forms (India)</Text>
        <Text style={styles.pageSubtitle}>
          Bail, affidavits, address/residence templates, and common
          applications.
        </Text>

        <View style={styles.sectionWrap}>
          <SectionCard
            title="Misc. Forms"
            description="Open commonly used form PDFs by category."
            ctaText={"Browse categories"}
            onPress={() => {
              // no extra route needed; this screen already shows the categories
            }}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#D4AF37" />
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : error ? (
          <View style={styles.note}>
            <Text style={styles.noteText}>{error}</Text>
          </View>
        ) : normalized.length === 0 ? (
          <View style={styles.note}>
            <Text style={styles.noteText}>No misc forms available.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {normalized.map((cat, catIdx) => (
              <View
                key={`${cat.category}-${catIdx}`}
                style={styles.categoryBlock}
              >
                <Text style={styles.categoryTitle}>{cat.category}</Text>

                {cat.items!.map((item, idx) => (
                  <Pressable
                    key={`${cat.category}-${idx}-${item.name}`}
                    onPress={() => item.url && Linking.openURL(item.url)}
                    style={styles.card}
                  >
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardLink}>Open</Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f4f4" },
  body: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  sectionWrap: { marginTop: 6 },

  pageTitle: {
    color: "#f3a30e",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 10,
  },
  pageSubtitle: {
    color: "#999",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  center: {
    marginTop: 30,
    alignItems: "center",
    gap: 10,
  },
  loadingText: { color: "#999", fontSize: 13 },
  note: {
    marginTop: 10,
    backgroundColor: "#121212",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2E3135",
  },
  noteText: { color: "#C9C9C9", fontSize: 13, lineHeight: 18 },
  list: { gap: 16, marginTop: 6 },
  categoryBlock: { gap: 10 },
  categoryTitle: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2E3135",
    gap: 6,
  },
  cardTitle: {
    color: "#D4AF37",
    fontSize: 15,
    fontWeight: "800",
  },
  cardLink: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "700",
  },
});
