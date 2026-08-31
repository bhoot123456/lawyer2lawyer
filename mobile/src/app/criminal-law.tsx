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

type CriminalLawAct = {
  title?: string;
  actName?: string;
  pdfUrl?: string;
};

export default function CriminalLawScreen() {
  // Legacy screen kept for backward compatibility; the premium module is at /criminal-laws.

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CriminalLawAct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/criminal-law-acts");
        const acts = res?.data?.criminalLawActs || [];
        if (mounted) setItems(Array.isArray(acts) ? acts : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load criminal law acts");
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
    return items
      .map((x) => ({
        title: x?.title || x?.actName,
        pdfUrl: x?.pdfUrl,
        actName: x?.actName,
      }))
      .filter((x) => !!x.title);
  }, [items]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.pageTitle}>Criminal Law (Acts & PDFs)</Text>
        <Text style={styles.pageSubtitle}>Legacy list view. Use the premium Criminal Laws module for search, categories, favorites, and bookmarks.</Text>


        <View style={styles.sectionWrap}>
          <SectionCard
            title="Criminal Laws (Premium)"
            description="Search & filter 100+ Central Acts. Favorite and bookmark for quick access."
            ctaText={"Open premium module"}
            onPress={() => {
              // @ts-ignore
              // expo-router router instance is not imported here; navigate via Linking as fallback.
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
            <Text style={styles.noteText}>No criminal law acts available.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {normalized.map((act, idx) => (
              <Pressable
                key={`${act.title}-${idx}`}
                onPress={() => {
                  if (act.pdfUrl) Linking.openURL(act.pdfUrl);
                }}
                style={[styles.card, !act.pdfUrl ? styles.cardDisabled : null]}
              >
                <Text style={styles.cardTitle}>{act.title}</Text>
                {act.pdfUrl ? (
                  <Text style={styles.cardLink}>Open PDF</Text>
                ) : (
                  <Text style={styles.cardLinkDisabled}>PDF not available</Text>
                )}
              </Pressable>
            ))}

          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eeecec" },
  body: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  sectionWrap: { marginTop: 6 },

  pageTitle: {
    color: "#0f0f0f",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 10,
  },
  pageSubtitle: {
    color: "#324ef1",
    fontSize: 15,
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
    backgroundColor: "#f3ebeb",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2E3135",
  },
  noteText: { color: "#C9C9C9", fontSize: 15, lineHeight: 18 },
  list: { gap: 12, marginTop: 6 },
  card: {
    backgroundColor: "#f1e9e9",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2E3135",
    gap: 6,
  },
  cardTitle: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "800",
  },
  cardLink: {
    color: "#166df0",
    fontSize: 12,
    fontWeight: "700",
  },
  cardLinkDisabled: {
    color: "#999",
    fontSize: 12,
    fontWeight: "700",
  },
  cardDisabled: {
    opacity: 0.7,
  },
});
