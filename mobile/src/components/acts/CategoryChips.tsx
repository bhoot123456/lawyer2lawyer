import React from "react";
import { colors } from "@/theme/designSystem";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export type CategoryChip = {
  key: string;
  label: string;
};

export default function CategoryChips({
  categories,
  selectedKey,
  onSelect,
}: {
  categories: CategoryChip[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wrap}>
      {categories.map((c) => {
        const active = c.key === selectedKey;
        return (
          <TouchableOpacity
            key={c.key}
            onPress={() => onSelect(c.key)}
            style={[styles.chip, active ? styles.chipActive : null, active ? { borderColor: active ? colors.accent.gold : undefined } : null]}
          >
            <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border.gold,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginRight: 8,
  },
  chipActive: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.border.goldLight,
  },
  chipText: { fontSize: 12, fontWeight: "800", color: "#6B7280" },
  chipTextActive: { color: colors.accent.gold },
});

