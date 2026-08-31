import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import PremiumButton from "@/components/ui/PremiumButton";
import { colors, spacing, typography } from "@/theme/designSystem";

interface DashboardEmptyStateProps {
  title?: string;
  subtitle?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const GOLD = colors.accent.gold;
const TEXT_PRIMARY = colors.text.primary;
const TEXT_SECONDARY = colors.text.secondary;

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  title = "No data available",
  subtitle = "There's nothing to display here yet",
  onAction,
  actionLabel = "Refresh",
}) => {
  return (
    <View style={styles.container}>
      <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={3}>
        <View style={styles.content}>
          <Ionicons name="document-outline" size={48} color={GOLD} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {onAction && (
            <PremiumButton label={actionLabel} onPress={onAction} variant="secondary" />
          )}
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  content: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    color: TEXT_PRIMARY,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
  },
});

export default DashboardEmptyState;