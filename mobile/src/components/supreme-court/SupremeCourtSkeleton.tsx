import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { colors, radii, shadows, spacing } from "@/theme/designSystem";

const shimmerColor = "rgba(255,255,255,0.04)";
const baseColor = "rgba(255,255,255,0.08)";

/**
 * Skeleton row for a single court room card.
 */
const SkeletonCard: React.FC = () => {
  const opacity = useMemo(() => new Animated.Value(0.3), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      {/* Header skeleton */}
      <View style={styles.headerRow}>
        <View style={styles.iconPlaceholder} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={styles.titlePlaceholder} />
          <View style={styles.badgePlaceholder} />
        </View>
        <View style={styles.favPlaceholder} />
      </View>

      {/* Detail rows skeleton */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailIconPlaceholder} />
          <View style={styles.detailTextPlaceholder} />
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailIconPlaceholder} />
          <View style={styles.detailTextPlaceholder} />
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailIconPlaceholder} />
          <View style={styles.detailTextPlaceholder} />
        </View>
      </View>

      {/* Footer skeleton */}
      <View style={styles.footerRow}>
        <View style={styles.buttonPlaceholder} />
        <View style={styles.buttonPlaceholder} />
      </View>
    </Animated.View>
  );
};

/**
 * SupremeCourtSkeleton – Loading skeleton for the court list.
 */
const SupremeCourtSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={`skeleton-${index}`} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingTop: 4,
  },
  card: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
    padding: spacing.md,
    gap: 14,
    ...shadows.level1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: baseColor,
  },
  titlePlaceholder: {
    width: "60%",
    height: 16,
    borderRadius: 8,
    backgroundColor: baseColor,
  },
  badgePlaceholder: {
    width: "30%",
    height: 22,
    borderRadius: 11,
    backgroundColor: baseColor,
  },
  favPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: baseColor,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: shimmerColor,
  },
  detailIconPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: baseColor,
  },
  detailTextPlaceholder: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: baseColor,
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
  },
  buttonPlaceholder: {
    flex: 1,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: baseColor,
  },
});

export default SupremeCourtSkeleton;