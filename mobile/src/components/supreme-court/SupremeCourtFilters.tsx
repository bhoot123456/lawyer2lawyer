import React from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { CourtRoomStatus, SupremeCourtFiltersProps } from "@/types/supremeCourt";

/**
 * Filter option configuration.
 */
const FILTER_OPTIONS: { label: string; value: CourtRoomStatus | "All"; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "All Courts", value: "All", icon: "grid-outline" },
  { label: "Live", value: "Live", icon: "radio-button-on-outline" },
  { label: "Scheduled", value: "Scheduled", icon: "time-outline" },
  { label: "Offline", value: "Offline", icon: "power-outline" },
];

/**
 * SupremeCourtFilters – Filter chips for filtering court rooms by status.
 */
const SupremeCourtFilters: React.FC<SupremeCourtFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.value;
        const count = counts[option.value] ?? 0;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chip,
              isActive && styles.chipActive,
            ]}
            onPress={() => onFilterChange(option.value)}
            activeOpacity={0.7}
            accessibilityLabel={`Filter by ${option.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={option.icon}
              size={14}
              color={isActive ? colors.bg.primary : "#94A3B8"}
            />
            <Text
              style={[
                styles.chipLabel,
                isActive && styles.chipLabelActive,
              ]}
            >
              {option.label}
            </Text>
            {count > 0 && (
              <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                <Text style={[styles.countText, isActive && styles.countTextActive]}>
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 14,
  },
  container: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
  },
  chipActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  chipLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
  },
  chipLabelActive: {
    color: colors.bg.primary,
  },
  countBadge: {
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  countBadgeActive: {
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  countText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
  },
  countTextActive: {
    color: colors.bg.primary,
  },
});

export default SupremeCourtFilters;