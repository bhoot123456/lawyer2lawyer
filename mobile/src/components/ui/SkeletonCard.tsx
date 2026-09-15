import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

type SkeletonCardProps = {
  lines?: number;
  showAvatar?: boolean;
  showActions?: boolean;
};

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showAvatar = false,
  showActions = false,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {showAvatar ? <View style={styles.avatar} /> : null}
        <View style={styles.headerText}>
          <View style={styles.line} />
          <View style={[styles.line, { width: "60%" }]} />
        </View>
      </View>
      <View style={styles.body}>
        {Array.from({ length: lines }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.line,
              i === lines - 1 ? { width: "40%" } : undefined,
            ]}
          />
        ))}
      </View>
      {showActions ? (
        <View style={styles.actions}>
          <View style={[styles.line, { width: 80, height: 36, borderRadius: radii.md }]} />
          <View style={[styles.line, { width: 80, height: 36, borderRadius: radii.md }]} />
        </View>
      ) : null}
    </View>
  );
};

const shimmerColor = "rgba(255,255,255,0.04)";
const baseColor = "rgba(255,255,255,0.08)";

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    gap: spacing.md,
    ...({
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
      boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
    } as any),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: baseColor,
  },
  body: {
    gap: 10,
  },
  line: {
    height: 14,
    borderRadius: 7,
    backgroundColor: baseColor,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});

export default SkeletonCard;
