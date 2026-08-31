import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import type { HearingItem, DraftItem, ClientCallItem, AIInsight } from "./types";

interface DailyBriefCardProps {
  todayHearings: HearingItem[];
  pendingDrafts: DraftItem[];
  pendingClientCalls: ClientCallItem[];
  todayRevenue: number;
  aiInsights: AIInsight[];
  loading?: boolean;
}

const GOLD = "#B58D3D";
const TEXT_PRIMARY = "#F8FAFC";
const TEXT_SECONDARY = "#B0B4BA";

const BriefItem: React.FC<{
  icon: string;
  label: string;
  value: number | string;
  color?: string;
}> = ({ icon, label, value, color = GOLD }) => {
  return (
    <View style={styles.briefItem}>
      <View style={[styles.briefIcon, { backgroundColor: `rgba(181, 141, 61, 0.12)` }]}>
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
      <GlassCard borderColor="rgba(181, 141, 61, 0.25)" accent={GOLD}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading daily brief...</Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <GlassCard borderColor="rgba(181, 141, 61, 0.25)" accent={GOLD}>
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
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "900",
  },
  briefGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  briefItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "48%",
  },
  briefIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  briefContent: {
    flex: 1,
  },
  briefValue: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "900",
  },
  briefLabel: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: "700",
  },
  aiSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(181, 141, 61, 0.2)",
    gap: 8,
  },
  aiSectionTitle: {
    color: GOLD,
    fontSize: 13,
    fontWeight: "800",
  },
  aiInsightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  aiInsightText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "700",
  },
});

export default DailyBriefCard;