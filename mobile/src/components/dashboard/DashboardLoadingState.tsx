import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import GlassCard from "@/components/ui/GlassCard";
import { colors, spacing, typography } from "@/theme/designSystem";

const GOLD = colors.accent.gold;
const TEXT_SECONDARY = colors.text.secondary;

const DashboardLoadingState: React.FC = () => {
  return (
    <View style={styles.container}>
      <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={3}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.text}>Loading your workspace...</Text>
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
  text: {
    color: TEXT_SECONDARY,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    letterSpacing: 0.2,
  },
});

export default DashboardLoadingState;