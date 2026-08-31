import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

type Tribunal = {
  category?: string;
  jurisdictionLevel?: string;
};

type Props = {
  title: string;
  description: string;
  count: number;
  expanded: boolean;
  onToggle?: () => void;
};

const CATEGORY_META: Record<string, { title: string; description: string; icon: string }> = {
  National: {
    title: "National Tribunals",
    description: "Principal tribunals with jurisdiction across India.",
    icon: "globe-outline",
  },
  Delhi: {
    title: "Delhi State Tribunals",
    description: "State-level tribunals seated in Delhi.",
    icon: "location-outline",
  },
  District: {
    title: "District Tribunals",
    description: "District-level judicial tribunals and authorities.",
    icon: "map-outline",
  },
  Consumer: {
    title: "Consumer Commissions",
    description: "National, state and district consumer redressal commissions.",
    icon: "people-outline",
  },
  Quasi: {
    title: "Quasi Judicial Authorities",
    description: "Specialised quasi-judicial bodies and tribunals.",
    icon: "shield-checkmark-outline",
  },
};

const SectionHeader = React.memo(function SectionHeader({ title, description, count, expanded, onToggle }: Props) {
  const meta = CATEGORY_META[title] || {
    title,
    description: `${count} tribunal${count === 1 ? "" : "s"}`,
    icon: "business-outline",
  };

  return (
    <Pressable onPress={onToggle} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={meta.icon as any} size={20} color={colors.accent.gold} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{meta.title}</Text>
            <Text style={styles.description}>{meta.description}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
          <View style={styles.chevronContainer}>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.accent.gold}
            />
          </View>
        </View>
      </View>
      <View style={styles.divider} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: "hidden",
    marginBottom: spacing.sm,
    ...shadows.level1,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    gap: spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    lineHeight: typography.h4.lineHeight,
  },
  description: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    minWidth: 28,
    alignItems: "center",
  },
  countText: {
    color: colors.accent.gold,
    fontSize: typography.caption.fontSize,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },
});

export default SectionHeader;