import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import PremiumButton from "@/components/ui/PremiumButton";
import { colors, spacing, typography } from "@/theme/designSystem";

interface DashboardErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const GOLD = colors.accent.gold;
const ERROR_RED = colors.semantic.danger;
const TEXT_SECONDARY = colors.text.secondary;

const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({
  message,
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <GlassCard borderColor="rgba(239, 68, 68, 0.3)" accent={ERROR_RED} elevation={3}>
        <View style={styles.content}>
          <Ionicons name="alert-circle-outline" size={48} color={ERROR_RED} />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{message}</Text>
          {onRetry && (
            <PremiumButton label="Retry" onPress={onRetry} variant="secondary" />
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
    color: ERROR_RED,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
  },
  message: {
    color: TEXT_SECONDARY,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
  },
});

export default DashboardErrorState;