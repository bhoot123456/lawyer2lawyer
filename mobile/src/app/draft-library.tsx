import React, { useEffect, useMemo, useState } from "react";
import { colors, radii, spacing, typography } from "@/theme/designSystem";
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
      <GlassCard borderColor={colors.border.gold} accent={colors.accent.gold}>
        <View style={styles.headerRow}>
          <View style={styles.badgeIcon}>
            <Ionicons name="document-text-outline" size={20} color={colors.accent.gold} />
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
              color={colors.accent.gold}
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
              color={colors.accent.gold}
            />
            <Text style={styles.toggleText}>
              Saved Drafts ({savedDrafts.length})
            </Text>
            <Ionicons
              name={showSaved ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.accent.gold}
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
          <ActivityIndicator size="small" color={colors.accent.gold} />
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
              <Ionicons name="chevron-forward" size={18} color={colors.accent.gold} />
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
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 110,
    backgroundColor: colors.bg.primary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.border.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    marginTop: 6,
    lineHeight: typography.caption.lineHeight,
  },
  noteBox: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    backgroundColor: colors.accent.goldSubtle,
    borderRadius: radii.lg,
    padding: spacing.sm,
  },
  noteText: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.fontWeight,
    flex: 1,
  },
  sectionHeader: {
    color: colors.text.primary,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    marginTop: 2,
  },
  cards: {
    gap: spacing.sm,
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    backgroundColor: colors.bg.surface,
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radii.lg,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: colors.accent.gold,
    fontWeight: "800",
    fontSize: 15,
  },
  cardDesc: {
    color: colors.text.secondary,
    fontWeight: typography.caption.fontWeight,
    fontSize: typography.caption.fontSize,
    marginTop: 4,
    lineHeight: typography.caption.lineHeight,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    backgroundColor: colors.accent.goldSubtle,
  },
  toggleText: {
    color: colors.accent.gold,
    fontWeight: "800",
    fontSize: typography.body.fontSize,
    flex: 1,
  },
  savedList: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    backgroundColor: colors.bg.surface,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  savedTitle: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: typography.caption.fontSize,
  },
  savedMeta: {
    color: colors.text.muted,
    fontWeight: typography.caption.fontWeight,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.semantic.dangerSubtle,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
});