import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import type { ActivityItem } from "./types";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

interface RecentActivityCardProps {
  activities: ActivityItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const GOLD = colors.accent.gold;
const TEXT_PRIMARY = colors.text.primary;
const TEXT_SECONDARY = colors.text.secondary;
const ERROR_RED = colors.semantic.danger;

const getActivityIcon = (type: ActivityItem["type"]): string => {
  switch (type) {
    case "case":
      return "briefcase-outline";
    case "document":
      return "document-outline";
    case "payment":
      return "cash-outline";
    case "client":
      return "people-outline";
    case "hearing":
      return "time-outline";
    default:
      return "ellipse-outline";
  }
};

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  activities,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Recent Activity</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading activity...</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Recent Activity</Text>
        <GlassCard borderColor="rgba(239, 68, 68, 0.3)" accent={ERROR_RED} elevation={1}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color={ERROR_RED} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Recent Activity</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={34} color={GOLD} />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>Recent Activity</Text>
      <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
        <View style={styles.listContainer}>
          {activities.slice(0, 5).map((activity, index) => (
            <React.Fragment key={activity.id}>
              <View style={styles.activityRow}>
                <View style={styles.activityIconContainer}>
                  <Ionicons
                    name={getActivityIcon(activity.type) as any}
                    size={16}
                    color={GOLD}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {activity.title}
                  </Text>
                  <Text style={styles.activityDescription} numberOfLines={1}>
                    {activity.description}
                  </Text>
                </View>
                <Text style={styles.activityTime}>
                  {new Date(activity.timestamp).toLocaleDateString()}
                </Text>
              </View>
              {index < activities.slice(0, 5).length - 1 && (
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
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: TEXT_PRIMARY,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    lineHeight: typography.h4.lineHeight,
  },
  activityDescription: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
    marginTop: 2,
  },
  activityTime: {
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

export default RecentActivityCard;