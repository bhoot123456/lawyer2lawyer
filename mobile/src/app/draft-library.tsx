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
import {
  getDraftLibraryPhase11,
  getSavedDrafts,
  deleteDraft,
} from "@/services/draftLibraryApi";

type Section = {
  key: string;
  title: string;
  icon: string;
  description: string;
};

type SavedDraft = {
  _id: string;
  title: string;
  templateId: string;
  sectionKey: string;
  updatedAt: string;
};

export default function DraftLibraryScreen() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [libRes, savedRes] = await Promise.all([
        getDraftLibraryPhase11(),
        getSavedDrafts().catch(() => ({ drafts: [] })),
      ]);
      setData(libRes);
      setSavedDrafts(savedRes?.drafts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await loadData();
    })();
  }, []);

  const sections: Section[] = useMemo(() => data?.sections || [], [data]);

  const handleDelete = async (id: string) => {
    await deleteDraft(id);
    setSavedDrafts((prev) => prev.filter((d) => d._id !== id));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GlassCard borderColor="rgba(181, 141, 61, 0.35)" accent="#B58D3D">
        <View style={styles.headerRow}>
          <View style={styles.badgeIcon}>
            <Ionicons name="document-text-outline" size={20} color="#D4AF37" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Draft Library • </Text>
            <Text style={styles.subtitle}>
              • Bail • Agreement • Affidavit • Power of Attorney •
              Rent Agreement • Sale Deed • GST Reply • Income Tax Reply •
              Revenue Appeal
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

      {/* Saved Drafts Section */}
      {savedDrafts.length > 0 && (
        <View>
          <Pressable
            style={styles.toggleRow}
            onPress={() => setShowSaved(!showSaved)}
          >
            <Ionicons
              name={showSaved ? "bookmark" : "bookmark-outline"}
              size={18}
              color="#D4AF37"
            />
            <Text style={styles.toggleText}>
              Saved Drafts ({savedDrafts.length})
            </Text>
            <Ionicons
              name={showSaved ? "chevron-up" : "chevron-down"}
              size={16}
              color="#B58D3D"
            />
          </Pressable>

          {showSaved && (
            <View style={styles.savedList}>
              {savedDrafts.map((draft) => (
                <View key={draft._id} style={styles.savedRow}>
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() =>
                      router.push(
                        `/draft-library/${draft.sectionKey}?templateId=${draft.templateId}&savedId=${draft._id}` as any,
                      )
                    }
                  >
                    <Text style={styles.savedTitle}>{draft.title}</Text>
                    <Text style={styles.savedMeta}>
                      Updated: {new Date(draft.updatedAt).toLocaleDateString()}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(draft._id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {loading ? (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator size="small" color="#B58D3D" />
        </View>
      ) : null}

      <Text style={styles.sectionHeader}>Template Categories</Text>

      <View style={styles.cards}>
        {sections.map((s) => (
          <Pressable
            key={s.key}
            style={({ pressed }) => [
              styles.card,
              pressed ? { opacity: 0.92 } : null,
            ]}
            onPress={() => router.push(`/draft-library/${s.key}` as any)}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardIconWrap}>
                <Ionicons name={s.icon as any} size={22} color="#D4AF37" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {s.description}
                </Text>
              </View>
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
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
    lineHeight: 15,
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
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(181,141,61,0.12)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 15,
  },
  cardDesc: {
    color: "rgba(248,250,252,0.65)",
    fontWeight: "800",
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.20)",
    backgroundColor: "rgba(181,141,61,0.06)",
  },
  toggleText: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 14,
    flex: 1,
  },
  savedList: {
    marginTop: 8,
    gap: 8,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.15)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 12,
    gap: 8,
  },
  savedTitle: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 13,
  },
  savedMeta: {
    color: "rgba(248,250,252,0.55)",
    fontWeight: "800",
    fontSize: 11,
    marginTop: 2,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
});