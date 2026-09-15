import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

interface HomeStatCardProps {
  value: string | number;
  label: string;
  icon: string;
}

/**
 * HomeStatCard — compact single-metric card for the "Today at a Glance" row.
 * Reuses GlassCard for consistent elevation/border treatment.
 */
export default function HomeStatCard({ value, label, icon }: HomeStatCardProps) {
  return (
    <GlassCard
      borderColor={colors.border.goldLight}
      accent={colors.accent.gold}
      elevation={1}
      contentStyle={styles.cardContent}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={20} color={colors.accent.gold} />
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  value: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 28,
    textAlign: "center",
  },
  label: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
    textAlign: "center",
    lineHeight: typography.caption.lineHeight,
  },
});
