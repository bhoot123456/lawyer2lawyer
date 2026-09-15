import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { HearingItem } from "./types";
import { colors, shadows } from "@/theme/designSystem";

type Props = {
  hearings: HearingItem[];
  loading: boolean;
};

export function NextHearingCard({ hearings, loading }: Props) {
  if (loading) return null;
  if (!hearings || hearings.length === 0) {
    return (
      <View style={styles.cardEmpty}>
        <Ionicons name="calendar-outline" size={28} color={colors.border.gold} />
        <Text style={styles.emptyText}>No upcoming hearings scheduled.</Text>
      </View>
    );
  }

  // Find the closest future hearing
  const now = new Date();
  const futureHearings = hearings
    .map(h => ({ ...h, d: new Date(h.nextHearingDate as string) }))
    .filter(h => !isNaN(h.d.getTime()) && h.d >= now)
    .sort((a, b) => a.d.getTime() - b.d.getTime());

  if (futureHearings.length === 0) {
    return null;
  }

  const next = futureHearings[0];
  const dateStr = next.d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => router.push(`/cases/${next.id}` as any)}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="alert-circle" size={14} color="#D4AF37" />
          <Text style={styles.badgeText}>Next Hearing</Text>
        </View>
        <Text style={styles.date}>{dateStr}</Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {next.caseTitle || `Case #${next.caseNumber}`}
      </Text>
      <Text style={styles.court} numberOfLines={1}>
        {next.court || "Court not specified"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    gap: 8,
    // Featured content sits one level above routine list rows.
    ...shadows.level2,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  cardEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    color: "rgba(248, 250, 252, 0.6)",
    fontSize: 12,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    color: "#D4AF37",
    fontWeight: "800",
    fontSize: 10,
    textTransform: "uppercase",
  },
  date: {
    color: "#D4AF37",
    fontWeight: "800",
    fontSize: 12,
  },
  title: {
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 18,
    marginTop: 4,
  },
  court: {
    color: "rgba(248, 250, 252, 0.7)",
    fontWeight: "700",
    fontSize: 14,
  },
});
