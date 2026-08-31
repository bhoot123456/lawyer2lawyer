import React from "react";
import { View, Text, StyleSheet } from "react-native";

const STATUS_COLORS: Record<string, string> = {
  published: "#10B981",
  draft: "#F59E0B",
  archived: "#64748B",
  Live: "#10B981",
  Scheduled: "#3B82F6",
  Offline: "#64748B",
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
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
