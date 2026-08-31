import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

type ChipVariant = "filter" | "sort" | "advanced" | "action";

type CategoryChipProps = {
  label: string;
  active?: boolean;
  variant?: ChipVariant;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
};

const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  active = false,
  variant = "filter",
  onPress,
  icon,
  disabled = false,
}) => {
  const isFilter = variant === "filter";
  const isSort = variant === "sort";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        isFilter && styles.chipFilter,
        isSort && styles.chipSort,
        !isFilter && !isSort && styles.chipAdvanced,
        active && styles.chipActive,
        pressed && !disabled && styles.chipPressed,
        disabled && styles.chipDisabled,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          isFilter && styles.textFilter,
          isSort && styles.textSort,
          !isFilter && !isSort && styles.textAdvanced,
          active && styles.textActive,
          disabled && styles.textDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },
  chipFilter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSort: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  chipAdvanced: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.goldSubtle,
  },
  chipPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  chipDisabled: {
    opacity: 0.4,
  },
  iconWrap: {
    marginRight: 2,
  },
  text: {
    color: colors.text.secondary,
  },
  textFilter: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
  },
  textSort: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
  },
  textAdvanced: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  textActive: {
    color: colors.accent.gold,
    fontWeight: "700",
  },
  textDisabled: {
    color: colors.text.muted,
  },
});

export default CategoryChip;
