import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import GlassCard from "@/components/ui/GlassCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import ErrorState from "@/components/ui/ErrorState";
import { getKnowledgeHubPhase10 } from "@/services/knowledgeHubApi";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

type Section = {
  key: string;
  title: string;
  icon: string;
  description: string;
};

export default function KnowledgeHubScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await getKnowledgeHubPhase10();
      setData(res);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Unable to load the Knowledge Hub",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const run = async () => {
      await fetchData();
    };

    void run();
  }, [fetchData]);

  const sections: Section[] = useMemo(() => data?.sections || [], [data]);
  const featured: Section | undefined = sections[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GlassCard borderColor={colors.border.gold} accent={colors.accent.gold}>
        <Text style={styles.eyebrow}>DIGITAL LIBRARY</Text>
        <Text style={styles.title}>Knowledge Hub</Text>
        <Text style={styles.subtitle}>
          Bare Acts • Judgments • Circulars • Supreme Court • Delhi High Court •
          Tribunals • Revenue • Tax • Corporate • Templates
        </Text>

        <Pressable
          style={({ pressed }) => [styles.searchField, pressed && { opacity: 0.85 }]}
          onPress={() => router.push("/bare-acts" as any)}
          accessibilityRole="search"
          accessibilityLabel="Search bare acts"
        >
          <Ionicons name="search-outline" size={18} color={colors.text.secondary} />
          <Text style={styles.searchPlaceholder}>Search Bare Acts & more…</Text>
        </Pressable>

        {data?.lastUpdatedNote ? (
          <View style={styles.noteBox}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.accent.goldDark}
            />
            <Text style={styles.noteText}>{data.lastUpdatedNote}</Text>
          </View>
        ) : null}
      </GlassCard>

      {error && !loading ? (
        <ErrorState
          title="Couldn't load the library"
          message={error}
          onRetry={retry}
        />
      ) : null}

      {loading ? (
        <View style={styles.skeletons}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </View>
      ) : null}

      {!loading && !error && featured ? (
        <View>
          <Text style={styles.sectionHeader}>Featured</Text>
          <Pressable
            style={({ pressed }) => [
              styles.featuredCard,
              pressed ? { opacity: 0.92 } : null,
            ]}
            onPress={() => router.push(`/knowledge-hub/${featured.key}` as any)}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardIconWrap}>
                <Ionicons
                  name={(featured.icon || "library-outline") as any}
                  size={22}
                  color={colors.accent.gold}
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.featuredTag}>FEATURED</Text>
                <Text style={styles.cardTitle}>{featured.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {featured.description}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.accent.goldDark} />
            </View>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error ? (
        <View>
          <Text style={styles.sectionHeader}>Legal Resource Sections</Text>
          <View style={styles.cards}>
            {sections.map((s) => (
              <Pressable
                key={s.key}
                style={({ pressed }) => [styles.card, pressed ? { opacity: 0.92 } : null]}
                onPress={() => router.push(`/knowledge-hub/${s.key}` as any)}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardIconWrap}>
                    <Ionicons name={s.icon as any} size={22} color={colors.accent.gold} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{s.title}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {s.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.accent.goldDark} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 120,
    backgroundColor: colors.bg.primary,
  },
  eyebrow: {
    color: colors.accent.goldDark,
    fontSize: typography.overline.fontSize,
    fontWeight: typography.overline.fontWeight,
    lineHeight: typography.overline.lineHeight,
    letterSpacing: typography.overline.letterSpacing,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    lineHeight: typography.h2.lineHeight,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    flex: 1,
  },
  noteBox: {
    marginTop: spacing.md,
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
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
    flex: 1,
  },
  skeletons: {
    gap: spacing.md,
  },
  sectionHeader: {
    color: colors.text.primary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
    marginBottom: spacing.sm,
  },
  featuredCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.gold,
    backgroundColor: colors.bg.elevated,
    padding: spacing.md,
    ...shadows.level2,
  },
  featuredTag: {
    color: colors.accent.goldDark,
    fontSize: typography.overline.fontSize,
    fontWeight: typography.overline.fontWeight,
    letterSpacing: typography.overline.letterSpacing,
    marginBottom: 2,
  },
  cards: {
    gap: spacing.sm,
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
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
    color: colors.text.primary,
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
});