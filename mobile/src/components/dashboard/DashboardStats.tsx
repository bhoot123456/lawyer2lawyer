import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import type { DashboardStats as DashboardStatsType } from "./types";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

interface DashboardStatsProps {
  stats: DashboardStatsType;
  loading?: boolean;
}

const GOLD = colors.accent.gold;
const TEXT_PRIMARY = colors.text.primary;
const TEXT_SECONDARY = colors.text.secondary;

const StatItem: React.FC<{
  value: number | string;
  label: string;
  icon: string;
  loading?: boolean;
}> = ({ value, label, icon, loading }) => {
  return (
    <GlassCard
      borderColor={colors.border.goldLight}
      accent={GOLD}
      style={styles.statCard}
      elevation={1}
    >
      <View style={styles.statContent}>
        <View style={styles.statIconWrap}>
          <Ionicons name={icon as any} size={20} color={GOLD} />
        </View>
        <Text style={styles.statValue}>
          {loading ? "-" : value}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </GlassCard>
  );
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading }) => {
  const formatMoney = (amount: number): string => {
    if (!Number.isFinite(amount)) return "₹ 0";
    return amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  };

  return (
    <View style={styles.container}>
      <StatItem
        value={loading ? 0 : stats.todayHearings}
        label="Today's Hearings"
        icon="time-outline"
        loading={loading}
      />
      <StatItem
        value={loading ? 0 : stats.activeCases}
        label="Active Cases"
        icon="briefcase-outline"
        loading={loading}
      />
      <StatItem
        value={loading ? 0 : stats.pendingCases}
        label="Pending Cases"
        icon="hourglass-outline"
        loading={loading}
      />
      <StatItem
        value={loading ? "₹ 0" : formatMoney(stats.revenueToday)}
        label="Revenue Today"
        icon="cash-outline"
        loading={loading}
      />
      <StatItem
        value={loading ? 0 : stats.clientMeetings}
        label="Client Meetings"
        icon="people-outline"
        loading={loading}
      />
      <StatItem
        value={loading ? 0 : stats.pendingDrafts}
        label="Pending Drafts"
        icon="document-text-outline"
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  statCard: {
    width: "31%",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: {
    alignItems: "center",
    gap: spacing.xs,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    color: TEXT_PRIMARY,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    textAlign: "center",
  },
  statLabel: {
    color: TEXT_SECONDARY,
    fontSize: typography.overline.fontSize,
    fontWeight: typography.overline.fontWeight,
    lineHeight: typography.overline.lineHeight,
    letterSpacing: typography.overline.letterSpacing,
    textAlign: "center",
    marginTop: 2,
  },
});

export default DashboardStats;