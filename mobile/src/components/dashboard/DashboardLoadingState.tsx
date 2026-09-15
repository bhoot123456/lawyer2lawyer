import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { colors, spacing, typography } from "@/theme/designSystem";

const GOLD = colors.accent.gold;
const TEXT_SECONDARY = colors.text.secondary;

/**
 * DashboardLoadingState — Skeleton placeholders matching the actual stat-grid
 * and hearing-card layout, so the first paint feels considered rather than
 * like a wall of loading zeros.
 */
const DashboardLoadingState: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Next Hearing skeleton */}
      <SkeletonCard lines={2} showActions={false} />
      {/* Stats grid skeleton — 3 rows x 2 columns to match DashboardStats */}
      <View style={styles.statsGrid}>
        <SkeletonCard lines={2} showAvatar={false} showActions={false} />
        <SkeletonCard lines={2} showAvatar={false} showActions={false} />
      </View>
      <View style={styles.statsGrid}>
        <SkeletonCard lines={2} showAvatar={false} showActions={false} />
        <SkeletonCard lines={2} showAvatar={false} showActions={false} />
      </View>
      <View style={styles.statsGrid}>
        <SkeletonCard lines={2} showAvatar={false} showActions={false} />
        <SkeletonCard lines={2} showAvatar={false} showActions={false} />
      </View>
      <Text style={styles.text}>Loading your workspace...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  text: {
    color: TEXT_SECONDARY,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    letterSpacing: 0.2,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});

export default DashboardLoadingState;