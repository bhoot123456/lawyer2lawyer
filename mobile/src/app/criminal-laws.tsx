import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ActsSearchBar from "@/components/acts/ActsSearchBar";
import CategoryChips from "@/components/acts/CategoryChips";
import ActCard from "@/components/acts/ActCard";

import { api } from "@/services/api";
import {
  getBookmarkedActIds,
  getFavoriteActIds,
  toggleBookmarkedActId,
  toggleFavoriteActId,
} from "@/utils/actsStorage";

export type CriminalAct = {
  id: string;
  title: string;
  year?: number | string;
  shortDescription?: string;
  category?: string;
  searchSupport?: string;
  pdfUrl?: string | null;
  aiExplanationSupported?: boolean;
  bookmarkSupported?: boolean;
};

const CATEGORY_KEYS = [
  {
    key: "core-criminal-laws",
    label: "Core Criminal Laws",
  },
  { key: "police-investigation", label: "Police & Investigation" },
  { key: "women-children", label: "Women & Children" },
  { key: "economic-crimes", label: "Economic Crimes" },
  { key: "cyber-crimes", label: "Cyber Crimes" },
  { key: "national-security", label: "National Security" },
  { key: "anti-corruption", label: "Anti-Corruption" },
  { key: "drugs-narcotics", label: "Drugs & Narcotics" },
  { key: "environmental-crimes", label: "Environmental Crimes" },
  { key: "financial-crimes", label: "Financial Crimes" },
  { key: "ip-misc", label: "Intellectual Property" },
  { key: "misc", label: "Miscellaneous" },
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export default function CriminalLawsScreen() {
  const [loading, setLoading] = useState(true);
  const [acts, setActs] = useState<CriminalAct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>(
    CATEGORY_KEYS[0].key
  );

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  const [favoritesReady, setFavoritesReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/criminal-law-acts");
        const list: CriminalAct[] = Array.isArray(res?.data?.criminalLawActs)
          ? res.data.criminalLawActs
          : [];
        if (mounted) setActs(list);
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

  useEffect(() => {
    let mounted = true;

    async function loadStores() {
      const fav = await getFavoriteActIds();
      const bm = await getBookmarkedActIds();
      if (!mounted) return;
      setFavoriteIds(fav);
      setBookmarkIds(bm);
      setFavoritesReady(true);
    }

    loadStores();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => CATEGORY_KEYS, []);

  const filtered = useMemo(() => {
    const categoryLabel = categories.find((c) => c.key === selectedCategoryKey)?.label;
    const nq = normalize(q);

    return acts
      .filter((a) => {
        if (!categoryLabel) return true;
        return normalize(a.category || "").includes(normalize(categoryLabel));
      })
      .filter((a) => {
        if (!nq) return true;
        const hay = normalize(
          [a.title, a.shortDescription, a.category, a.searchSupport, a.year]
            .filter(Boolean)
            .join(" ")
        );
        return hay.includes(nq);
      });
  }, [acts, categories, q, selectedCategoryKey]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.pageTitle}>Criminal Laws</Text>
        <Text style={styles.pageSubtitle}>
          Search, filter by category, favorite, and bookmark acts. PDF/AI/notes are
          scaffolded for future expansion.
        </Text>

        <View style={styles.searchWrap}>
          <ActsSearchBar value={q} onChange={setQ} placeholder="Search acts by title, keyword, or year…" />
          <CategoryChips
            categories={categories}
            selectedKey={selectedCategoryKey}
            onSelect={setSelectedCategoryKey}
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
        ) : filtered.length === 0 ? (
          <View style={styles.note}>
            <Text style={styles.noteText}>No acts match your search/filter.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((act) => (
              <ActCard
                key={act.id}
                act={act}
                isFavorited={favoriteIds.has(act.id)}
                isBookmarked={bookmarkIds.has(act.id)}
                onToggleFavorite={async (actId) => {
                  const next = await toggleFavoriteActId(actId);
                  if (!favoritesReady) return;
                  setFavoriteIds((prev) => {
                    const copy = new Set(prev);
                    if (next) copy.add(actId);
                    else copy.delete(actId);
                    return copy;
                  });
                }}
                onToggleBookmark={async (actId) => {
                  const next = await toggleBookmarkedActId(actId);
                  if (!favoritesReady) return;
                  setBookmarkIds((prev) => {
                    const copy = new Set(prev);
                    if (next) copy.add(actId);
                    else copy.delete(actId);
                    return copy;
                  });
                }}
                onPressPrimary={(actId) => {
                  const a = acts.find((x) => x.id === actId);
                  if (a?.pdfUrl) Linking.openURL(a.pdfUrl);
                }}
              />
            ))}
          </View>
        )}

        <View style={styles.footerSpacer} />
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
  pageTitle: {
    color: "#0f0f0f",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 10,
  },
  pageSubtitle: {
    color: "#324ef1",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  searchWrap: {
    gap: 10,
    marginTop: 6,
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
  footerSpacer: { height: 40 },
});

