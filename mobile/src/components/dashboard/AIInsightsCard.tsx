import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import type { AIInsight } from "./types";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

interface AIInsightsCardProps {
  insights: AIInsight[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const GOLD = colors.accent.gold;
const TEXT_PRIMARY = colors.text.primary;
const TEXT_SECONDARY = colors.text.secondary;
const ERROR_RED = colors.semantic.danger;

const getPriorityVariant = (priority?: string) => {
  switch (priority) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    default:
      return "gold";
  }
};

const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  insights,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>AI Insights</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading insights...</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>AI Insights</Text>
        <GlassCard borderColor="rgba(239, 68, 68, 0.3)" accent={ERROR_RED} elevation={1}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color={ERROR_RED} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (insights.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>AI Insights</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.emptyContainer}>
            <Ionicons name="bulb-outline" size={34} color={GOLD} />
            <Text style={styles.emptyText}>No AI insights available</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>AI Insights</Text>
      <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
        <View style={styles.listContainer}>
          {insights.slice(0, 3).map((insight, index) => (
            <React.Fragment key={insight.id}>
              <Pressable
                style={styles.insightRow}
                onPress={() => router.push("/ai-assistant" as any)}
              >
                <View style={styles.insightIconContainer}>
                  <Ionicons name="bulb-outline" size={18} color={GOLD} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle} numberOfLines={1}>
                    {insight.title}
                  </Text>
                  <Text style={styles.insightDescription} numberOfLines={2}>
                    {insight.description}
                  </Text>
                </View>
                {insight.priority && (
                  <StatusBadge label={insight.priority} variant={getPriorityVariant(insight.priority)} size="sm" />
                )}
              </Pressable>
              {index < insights.slice(0, 3).length - 1 && (
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
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    color: TEXT_PRIMARY,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    lineHeight: typography.h4.lineHeight,
  },
  insightDescription: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
    marginTop: 2,
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

export default AIInsightsCard;