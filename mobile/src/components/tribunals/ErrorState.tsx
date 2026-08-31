import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";
import PremiumButton from "@/components/ui/PremiumButton";

type Props = {
  message?: string;
  onRetry?: () => void;
};

const ErrorState = React.memo(function ErrorState({ message, onRetry }: Props) {
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={36} color={colors.semantic.danger} />
      </View>
      <Text style={styles.title}>Unable to Load Tribunals</Text>
      <Text style={styles.message}>
        {message || "We encountered an issue while loading the tribunal database. Please check your connection and try again."}
      </Text>
      {onRetry && (
        <Pressable onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: colors.semantic.dangerSubtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(239,68,68,0.2)",
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.semantic.danger,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
    textAlign: "center",
  },
  message: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
    maxWidth: 300,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.accent.gold,
    ...shadows.level1,
    marginTop: spacing.sm,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: typography.body.fontSize,
    fontWeight: "800",
  },
});

export default ErrorState;