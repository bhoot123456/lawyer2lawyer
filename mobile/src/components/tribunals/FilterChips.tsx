import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

type Chip = {
  label: string;
  value: string;
  icon?: string;
};

type Props = {
  chips: Chip[];
  activeValues: string[];
  onToggle: (value: string) => void;
  onClearAll?: () => void;
  multiSelect?: boolean;
};

const FilterChips = React.memo(function FilterChips({
  chips,
  activeValues,
  onToggle,
  onClearAll,
  multiSelect = true,
}: Props) {
  const hasActive = activeValues.length > 0;

  const handleClearAll = () => {
    if (onClearAll && hasActive) {
      onClearAll();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.chipsContainer}>
          {chips.map((chip) => {
            const isActive = activeValues.includes(chip.value);
            return (
              <Pressable
                key={chip.value}
                onPress={() => onToggle(chip.value)}
                style={({ pressed }) => [
                  styles.chip,
                  isActive && styles.chipActive,
                  pressed && styles.chipPressed,
                ]}
              >
                {chip.icon ? (
                  <Text style={[styles.chipIcon, isActive && styles.chipIconActive]}>
                    {chip.icon}
                  </Text>
                ) : null}
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                  numberOfLines={1}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {hasActive && onClearAll && (
        <Pressable onPress={handleClearAll} style={styles.clearAllButton}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: 4,
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
    ...shadows.level1,
    minHeight: 40,
  },
  chipActive: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.goldSubtle,
    ...shadows.level2,
  },
  chipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  chipIcon: {
    fontSize: 14,
  },
  chipIconActive: {
    opacity: 1,
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
  },
  chipTextActive: {
    color: colors.accent.gold,
    fontWeight: "700",
  },
  clearAllButton: {
    alignSelf: "flex-start",
    marginLeft: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.semantic.dangerSubtle,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  clearAllText: {
    color: colors.semantic.danger,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
});

export default FilterChips;