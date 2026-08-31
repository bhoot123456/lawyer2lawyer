import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import type { HearingItem } from "./types";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

interface TodayHearingsProps {
  hearings: HearingItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const GOLD = colors.accent.gold;
const TEXT_PRIMARY = colors.text.primary;
const TEXT_SECONDARY = colors.text.secondary;
const ERROR_RED = colors.semantic.danger;

const HearingCard: React.FC<{
  item: HearingItem;
  onPress?: () => void;
}> = ({ item, onPress }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "success";
      case "Urgent":
        return "danger";
      case "Postponed":
        return "warning";
      default:
        return "gold";
    }
  };

  return (
    <GlassCard
      borderColor={colors.border.goldLight}
      accent={GOLD}
      onPress={onPress}
      style={styles.hearingCard}
      elevation={1}
    >
      <View style={styles.hearingContent}>
        <View style={styles.hearingHeader}>
          <View style={styles.hearingIconContainer}>
            <Ionicons name="time-outline" size={20} color={GOLD} />
          </View>
          <View style={styles.hearingMain}>
            <Text style={styles.hearingTitle} numberOfLines={1}>
              {item.caseTitle || item.caseNumber}
            </Text>
            <Text style={styles.hearingCaseNumber} numberOfLines={1}>
              {item.caseNumber}
            </Text>
          </View>
          <StatusBadge label={item.status} variant={getStatusVariant(item.status)} dot />
        </View>

        <View style={styles.hearingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={14} color={TEXT_SECONDARY} />
            <Text style={styles.detailText}>{item.court}</Text>
          </View>
          {item.judge && (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={14} color={TEXT_SECONDARY} />
              <Text style={styles.detailText}>{item.judge}</Text>
            </View>
          )}
          {item.courtRoom && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color={TEXT_SECONDARY} />
              <Text style={styles.detailText}>Room {item.courtRoom}</Text>
            </View>
          )}
          {item.client && (
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={14} color={TEXT_SECONDARY} />
              <Text style={styles.detailText}>{item.client}</Text>
            </View>
          )}
        </View>

        <View style={styles.hearingFooter}>
          <Text style={styles.hearingTime}>
            {item.hearingTime ||
              (item.nextHearingDate
                ? new Date(item.nextHearingDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "")}
          </Text>
          <Pressable
            style={styles.openCaseButton}
            onPress={() => router.push(`/cases/${item.caseId}` as any)}
          >
            <Text style={styles.openCaseText}>Open Case</Text>
            <Ionicons name="chevron-forward" size={14} color={GOLD} />
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );
};

const TodayHearings: React.FC<TodayHearingsProps> = ({
  hearings,
  loading,
  error,
  onRetry,
}) => {
  if (loading) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Today&apos;s Hearings</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading hearings...</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Today&apos;s Hearings</Text>
        <GlassCard borderColor="rgba(239, 68, 68, 0.3)" accent={ERROR_RED} elevation={1}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color={ERROR_RED} />
            <Text style={styles.errorText}>{error}</Text>
            {onRetry && (
              <Pressable onPress={onRetry} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            )}
          </View>
        </GlassCard>
      </View>
    );
  }

  if (hearings.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Today&apos;s Hearings</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={32} color={GOLD} />
            <Text style={styles.emptyText}>No hearings scheduled for today</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>Today&apos;s Hearings</Text>
        {hearings.slice(0, 3).map((hearing) => (
          <HearingCard
            key={hearing.id}
            item={hearing}
            onPress={() => router.push(`/cases/${hearing.caseId}` as any)}
          />
        ))}
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
  hearingCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  hearingContent: {
    gap: spacing.sm,
  },
  hearingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  hearingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  hearingMain: {
    flex: 1,
  },
  hearingTitle: {
    color: TEXT_PRIMARY,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    lineHeight: typography.h4.lineHeight,
  },
  hearingCaseNumber: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
    marginTop: 2,
  },
  hearingDetails: {
    gap: 6,
    paddingLeft: 46,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
  },
  hearingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 46,
  },
  hearingTime: {
    color: GOLD,
    fontSize: typography.body.fontSize,
    fontWeight: "800",
  },
  openCaseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
  },
  openCaseText: {
    color: GOLD,
    fontSize: typography.caption.fontSize,
    fontWeight: "800",
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
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  retryText: {
    color: ERROR_RED,
    fontSize: typography.caption.fontSize,
    fontWeight: "800",
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

export default TodayHearings;