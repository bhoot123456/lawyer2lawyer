import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";
import PremiumButton from "@/components/ui/PremiumButton";

type Props = {
  query?: string;
  onClear?: () => void;
};

const EmptyState = React.memo(function EmptyState({ query, onClear }: Props) {
  const hasQuery = !!(query && query.trim().length > 0);
  const titleText = hasQuery ? "No Results Found" : "No Tribunals Available";
  const subtitleText = hasQuery
    ? "Try searching using another tribunal name, abbreviation, or jurisdiction."
    : "There are no tribunals to display at this time.";

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="business-outline" size={32} color={colors.accent.gold} />
      </View>
      <Text style={styles.title}>{titleText}</Text>
      <Text style={styles.subtitle}>{subtitleText}</Text>
      {hasQuery && onClear && (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear Search</Text>
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
    backgroundColor: colors.accent.goldSubtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border.gold,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
    textAlign: "center",
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: "center",
    maxWidth: 280,
  },
  clearButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.accent.gold,
    ...shadows.level1,
    marginTop: spacing.sm,
  },
  clearButtonText: {
    color: colors.text.inverse,
    fontSize: typography.body.fontSize,
    fontWeight: "800",
  },
});

export default EmptyState;