import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

const LoadingSkeleton = React.memo(function LoadingSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.searchSkeleton}>
        <View style={styles.searchIconPlaceholder} />
        <View style={styles.searchLinePlaceholder} />
      </View>

      <View style={styles.filtersSkeleton}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.chipPlaceholder} />
        ))}
      </View>

      <View style={styles.cardSkeleton}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitlePlaceholder} />
          <View style={styles.cardBadgePlaceholder} />
        </View>
        <View style={styles.cardBadgesRow}>
          <View style={styles.badgePlaceholder} />
          <View style={styles.badgePlaceholder} />
        </View>
        <View style={styles.cardDescriptionRow}>
          <View style={styles.descriptionLinePlaceholder} />
          <View style={[styles.descriptionLinePlaceholder, { width: "60%" }]} />
        </View>
        <View style={styles.cardInfoRow}>
          <View style={styles.infoPlaceholder} />
          <View style={[styles.infoPlaceholder, { width: "40%" }]} />
        </View>
        <View style={styles.cardActionsRow}>
          <View style={styles.actionPlaceholder} />
          <View style={styles.actionPlaceholder} />
          <View style={styles.actionPlaceholder} />
        </View>
      </View>
    </View>
  );
});

const shimmerColor = "rgba(255,255,255,0.04)";
const baseColor = "rgba(255,255,255,0.08)";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  searchSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg.elevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.md,
  },
  searchIconPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: baseColor,
  },
  searchLinePlaceholder: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    backgroundColor: baseColor,
  },
  filtersSkeleton: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  chipPlaceholder: {
    width: 80,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  cardSkeleton: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.level1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  cardTitlePlaceholder: {
    flex: 1,
    height: 18,
    borderRadius: 9,
    backgroundColor: baseColor,
  },
  cardBadgePlaceholder: {
    width: 60,
    height: 24,
    borderRadius: 12,
    backgroundColor: baseColor,
  },
  cardBadgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  badgePlaceholder: {
    width: 70,
    height: 26,
    borderRadius: 13,
    backgroundColor: baseColor,
  },
  cardDescriptionRow: {
    gap: 8,
  },
  descriptionLinePlaceholder: {
    height: 14,
    borderRadius: 7,
    backgroundColor: baseColor,
  },
  cardInfoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoPlaceholder: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: baseColor,
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionPlaceholder: {
    flex: 1,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: baseColor,
  },
});

export default LoadingSkeleton;