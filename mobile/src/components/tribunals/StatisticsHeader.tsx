import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

type Tribunal = {
  category?: string;
  jurisdictionLevel?: string;
  eFilingAvailable?: boolean;
  videoConferenceAvailable?: boolean;
};

type Props = {
  tribunals: Tribunal[];
};

const STATS_CONFIG = [
  {
    key: "total",
    label: "Total Tribunals",
    color: colors.accent.gold,
    bgColor: colors.accent.goldSubtle,
    borderColor: colors.border.goldLight,
    icon: "business-outline" as const,
  },
  {
    key: "national",
    label: "National",
    color: "#4A90E2",
    bgColor: "rgba(74,144,226,0.12)",
    borderColor: "rgba(74,144,226,0.3)",
    icon: "globe-outline" as const,
  },
  {
    key: "state",
    label: "State",
    color: "#50C878",
    bgColor: "rgba(80,200,120,0.12)",
    borderColor: "rgba(80,200,120,0.3)",
    icon: "location-outline" as const,
  },
  {
    key: "district",
    label: "District",
    color: "#FF8C42",
    bgColor: "rgba(255,140,66,0.12)",
    borderColor: "rgba(255,140,66,0.3)",
    icon: "map-outline" as const,
  },
  {
    key: "consumer",
    label: "Consumer",
    color: "#9B59B6",
    bgColor: "rgba(155,89,182,0.12)",
    borderColor: "rgba(155,89,182,0.3)",
    icon: "people-outline" as const,
  },
  {
    key: "quasi",
    label: "Quasi Judicial",
    color: "#1ABC9C",
    bgColor: "rgba(26,188,156,0.12)",
    borderColor: "rgba(26,188,156,0.3)",
    icon: "shield-checkmark-outline" as const,
  },
];

const StatisticsHeader = React.memo(function StatisticsHeader({ tribunals }: Props) {
  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      total: tribunals.length,
      national: 0,
      state: 0,
      district: 0,
      consumer: 0,
      quasi: 0,
    };

    tribunals.forEach((t) => {
      const cat = t?.category?.toLowerCase() || "";
      const level = t?.jurisdictionLevel?.toLowerCase() || "";

      if (cat.includes("national")) counts.national++;
      else if (cat.includes("delhi") || cat.includes("state")) counts.state++;
      else if (cat.includes("district")) counts.district++;
      else if (cat.includes("consumer")) counts.consumer++;
      else if (cat.includes("quasi")) counts.quasi++;

      if (!cat && level === "national") counts.national++;
      else if (!cat && level === "state") counts.state++;
      else if (!cat && level === "district") counts.district++;
    });

    return counts;
  }, [tribunals]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tribunal Database</Text>
      <Text style={styles.subtitle}>Quick overview of tribunals, commissions and authorities</Text>
      <View style={styles.grid}>
        {STATS_CONFIG.map((stat) => (
          <GlassCard
            key={stat.key}
            borderColor={stat.borderColor}
            accent={stat.color}
            style={styles.statCard}
            elevation={1}
          >
            <View style={styles.statIconWrap}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={[styles.statNumber, { color: stat.color }]}>
              {stats[stat.key as keyof typeof stats]}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </GlassCard>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: {
    color: colors.accent.gold,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    lineHeight: typography.h2.lineHeight,
    letterSpacing: typography.h2.letterSpacing,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statCard: {
    flex: 1,
    minWidth: "30%",
    padding: spacing.md,
    alignItems: "center",
    gap: 6,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statNumber: {
    fontSize: typography.h2.fontSize,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: typography.overline.fontSize,
    fontWeight: typography.overline.fontWeight,
    letterSpacing: typography.overline.letterSpacing,
    textAlign: "center",
  },
});

export default StatisticsHeader;