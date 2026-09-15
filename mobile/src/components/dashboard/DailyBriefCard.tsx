import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import type { HearingItem, DraftItem, ClientCallItem, AIInsight } from "./types";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

interface DailyBriefCardProps {
  todayHearings: HearingItem[];
  pendingDrafts: DraftItem[];
  pendingClientCalls: ClientCallItem[];
  todayRevenue: number;
  aiInsights: AIInsight[];
  loading?: boolean;
}

const GOLD = colors.accent.gold;
const TEXT_PRIMARY = colors.text.primary;
const TEXT_SECONDARY = colors.text.secondary;

const BriefItem: React.FC<{
  icon: string;
  label: string;
  value: number | string;
  color?: string;
}> = ({ icon, label, value, color = GOLD }) => {
  return (
    <View style={styles.briefItem}>
      <View
        style={[
          styles.briefIcon,
          { backgroundColor: colors.accent.goldSubtle },
        ]}
      >
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <View style={styles.briefContent}>
        <Text style={styles.briefValue}>{value}</Text>
        <Text style={styles.briefLabel}>{label}</Text>
      </View>
    </View>
  );
};

const DailyBriefCard: React.FC<DailyBriefCardProps> = ({
  todayHearings,
  pendingDrafts,
  pendingClientCalls,
  todayRevenue,
  aiInsights,
  loading,
}) => {
  const formatMoney = (amount: number): string => {
    if (!Number.isFinite(amount)) return "₹ 0";
    return amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  };

  if (loading) {
    return (
      <GlassCard borderColor={colors.border.gold} accent={GOLD}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading daily brief...</Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <GlassCard borderColor={colors.border.gold} accent={GOLD}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Ionicons name="document-text-outline" size={20} color={GOLD} />
          <Text style={styles.headerText}>Daily AI Brief</Text>
        </View>

        <View style={styles.briefGrid}>
          <BriefItem
            icon="time-outline"
            label="Hearings"
            value={todayHearings.length}
          />
          <BriefItem
            icon="document-text-outline"
            label="Drafts"
            value={pendingDrafts.length}
          />
          <BriefItem
            icon="call-outline"
            label="Calls"
            value={pendingClientCalls.length}
          />
          <BriefItem
            icon="cash-outline"
            label="Revenue"
            value={formatMoney(todayRevenue)}
          />
        </View>

        {aiInsights.length > 0 && (
          <View style={styles.aiSection}>
            <Text style={styles.aiSectionTitle}>AI Recommendations</Text>
            {aiInsights.slice(0, 2).map((insight) => (
              <View key={insight.id} style={styles.aiInsightItem}>
                <Ionicons name="bulb-outline" size={14} color={GOLD} />
                <Text style={styles.aiInsightText} numberOfLines={2}>
                  {insight.title}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerText: {
    color: TEXT_PRIMARY,
    fontSize: typography.h4.fontSize,
    fontWeight: "800",
  },
  briefGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  briefItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "48%",
  },
  briefIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  briefContent: {
    flex: 1,
  },
  briefValue: {
    color: TEXT_PRIMARY,
    fontSize: typography.body.fontSize,
    fontWeight: "800",
  },
  briefLabel: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
  },
  aiSection: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.goldLight,
    gap: spacing.sm,
  },
  aiSectionTitle: {
    color: GOLD,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.overline.fontWeight,
  },
  aiInsightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  aiInsightText: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
  },
});

export default DailyBriefCard;