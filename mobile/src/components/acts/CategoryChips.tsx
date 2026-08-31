import React from "react";
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
            style={[styles.chip, active ? styles.chipActive : null, active ? { borderColor: active ? "#B58D3D" : undefined } : null]}
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
    borderColor: "rgba(181,141,61,0.25)",
    backgroundColor: "rgba(255,255,255,0.7)",
    marginRight: 8,
  },
  chipActive: {
    borderColor: "#B58D3D",
    backgroundColor: "rgba(181,141,61,0.12)",
  },
  chipText: { fontSize: 12, fontWeight: "800", color: "#6B7280" },
  chipTextActive: { color: "#B58D3D" },
});

