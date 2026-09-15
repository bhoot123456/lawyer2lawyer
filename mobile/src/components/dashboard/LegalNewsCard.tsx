import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import type { LegalNewsItem } from "./types";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

interface LegalNewsCardProps {
  news: LegalNewsItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const GOLD = colors.accent.gold;
const TEXT_PRIMARY = colors.text.primary;
const TEXT_SECONDARY = colors.text.secondary;
const ERROR_RED = colors.semantic.danger;

const LegalNewsCard: React.FC<LegalNewsCardProps> = ({
  news,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Legal News</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading news...</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Legal News</Text>
        <GlassCard borderColor="rgba(239, 68, 68, 0.3)" accent={ERROR_RED} elevation={1}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color={ERROR_RED} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (news.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Legal News</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={34} color={GOLD} />
            <Text style={styles.emptyText}>No legal news available</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>Legal News</Text>
      <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
        <View style={styles.listContainer}>
          {news.slice(0, 3).map((item, index) => (
            <React.Fragment key={item.id}>
              <Pressable style={styles.newsRow}>
                <View style={styles.newsIconContainer}>
                  <Ionicons name="newspaper-outline" size={18} color={GOLD} />
                </View>
                <View style={styles.newsContent}>
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.newsSummary} numberOfLines={2}>
                    {item.summary}
                  </Text>
                  <Text style={styles.newsSource}>
                    {item.source} •{" "}
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </Text>
                </View>
              </Pressable>
              {index < news.slice(0, 3).length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    gap: spacing.sm,
  },
  sectionHeader: {
    color: TEXT_PRIMARY,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
    marginBottom: 4,
  },
  listContainer: {
    paddingVertical: spacing.xs,
  },
  newsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  newsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    color: TEXT_PRIMARY,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    lineHeight: typography.h4.lineHeight,
    marginBottom: 4,
  },
  newsSummary: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
    marginBottom: 4,
  },
  newsSource: {
    color: GOLD,
    fontSize: typography.overline.fontSize,
    fontWeight: typography.overline.fontWeight,
    letterSpacing: typography.overline.letterSpacing,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.goldLight,
    marginVertical: spacing.xs,
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
  },
  errorContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: {
    color: ERROR_RED,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    textAlign: "center",
  },
  emptyContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: {
    color: TEXT_SECONDARY,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    textAlign: "center",
  },
});

export default LegalNewsCard;