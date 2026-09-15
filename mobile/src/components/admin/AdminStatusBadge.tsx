import React from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet } from "react-native";

const STATUS_COLORS: Record<string, string> = {
  published: colors.semantic.success,
  draft: colors.semantic.warning,
  archived: colors.text.muted,
  Live: colors.semantic.success,
  Scheduled: colors.semantic.info,
  Offline: colors.text.muted,
};

export default function AdminStatusBadge({ status }: { status?: string | null }) {
  const label = status ? String(status) : "—";
  const color = STATUS_COLORS[label] || "#94A3B8";
  return (
    <View style={[styles.badge, { borderColor: `${color}55`, backgroundColor: `${color}18` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
