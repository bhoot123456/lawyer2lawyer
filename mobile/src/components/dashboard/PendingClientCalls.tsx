import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ClientCallItem } from "./types";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

interface PendingClientCallsProps {
  calls: ClientCallItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const GOLD = colors.accent.gold;
const TEXT_PRIMARY = colors.text.primary;
const TEXT_SECONDARY = colors.text.secondary;
const ERROR_RED = colors.semantic.danger;

const PendingClientCalls: React.FC<PendingClientCallsProps> = ({
  calls,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Pending Client Calls</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading client calls...</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Pending Client Calls</Text>
        <GlassCard borderColor="rgba(239, 68, 68, 0.3)" accent={ERROR_RED} elevation={1}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color={ERROR_RED} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (calls.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Pending Client Calls</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.emptyContainer}>
            <Ionicons name="call-outline" size={34} color={GOLD} />
            <Text style={styles.emptyText}>No pending client calls</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>Pending Client Calls</Text>
      <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
        <View style={styles.listContainer}>
          {calls.slice(0, 4).map((call, index) => (
            <React.Fragment key={call.id}>
              <Pressable
                style={styles.listRow}
                onPress={() => router.push("/court-diary" as any)}
              >
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientAvatarText}>
                    {call.clientName?.[0]?.toUpperCase() || "C"}
                  </Text>
                </View>
                <View style={styles.listMain}>
                  <Text style={styles.listTitle} numberOfLines={1}>
                    {call.clientName}
                  </Text>
                  <Text style={styles.listSub} numberOfLines={1}>
                    {call.purpose ||
                      (call.scheduledAt
                        ? `Scheduled ${new Date(call.scheduledAt).toLocaleDateString()}`
                        : "Call pending")}
                  </Text>
                </View>
                <StatusBadge label={call.status || "Pending"} variant="gold" size="sm" />
              </Pressable>
              {index < calls.slice(0, 4).length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    gap: spacing.sm,
  },
  sectionHeader: {
    color: TEXT_PRIMARY,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
    marginBottom: 4,
  },
  listContainer: {
    paddingVertical: spacing.xs,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  clientAvatar: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  clientAvatarText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "800",
  },
  listMain: {
    flex: 1,
  },
  listTitle: {
    color: TEXT_PRIMARY,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    lineHeight: typography.h4.lineHeight,
  },
  listSub: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.goldLight,
    marginVertical: spacing.xs,
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
  errorContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: {
    color: ERROR_RED,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    textAlign: "center",
  },
  emptyContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: {
    color: TEXT_SECONDARY,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    textAlign: "center",
  },
});

export default PendingClientCalls;