import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import { colors, radii, spacing, typography } from "@/theme/designSystem";
import type { HearingItem } from "@/components/dashboard/types";
import { blurActiveElement } from "@/utils/blurActiveElement";

interface HomeNextHearingProps {
  hearings: HearingItem[];
  loading: boolean;
}

interface HearingWithDate extends HearingItem {
  dateObj: Date;
}

/**
 * HomeNextHearing — the strongest operational card on the Daily CourtDesk.
 *
 * Finds the closest future hearing from the combined today + upcoming pool,
 * then displays time, case title, case number, court, courtroom, and judge —
 * exactly the details a Delhi advocate needs before heading to court.
 *
 * Deliberately separate from the Dashboard's NextHearingCard (which only
 * shows case title + court) so that neither screen is altered.
 */
export default function HomeNextHearing({
  hearings,
  loading,
}: HomeNextHearingProps) {
  if (loading) {
    return (
      <GlassCard
        borderColor={colors.border.goldLight}
        accent={colors.accent.gold}
        elevation={2}
      >
        <View style={styles.loadingContainer}>
          <Ionicons name="time-outline" size={24} color={colors.text.muted} />
          <Text style={styles.loadingText}>Loading next hearing…</Text>
        </View>
      </GlassCard>
    );
  }

  // Find the closest future hearing
  const now = new Date();
  const future = (hearings || [])
    .map((h): HearingWithDate => ({
      ...h,
      dateObj: new Date(h.nextHearingDate || ""),
    }))
    .filter((h) => !isNaN(h.dateObj.getTime()) && h.dateObj >= now)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  if (future.length === 0) {
    return (
      <GlassCard
        borderColor={colors.border.goldLight}
        accent={colors.accent.gold}
        elevation={2}
      >
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={28} color={colors.accent.gold} />
          <Text style={styles.emptyText}>No upcoming hearings scheduled</Text>
        </View>
      </GlassCard>
    );
  }

  const next = future[0];
  const dateStr = next.dateObj.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr =
    next.hearingTime ||
    next.dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleOpenCase = () => {
    blurActiveElement();
    router.push(`/cases/${next.id}` as any);
  };

  return (
    <GlassCard
      borderColor={colors.border.gold}
      accent={colors.accent.gold}
      elevation={2}
    >
      <View style={styles.card}>
        {/* Header: badge + date */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Ionicons name="time-outline" size={14} color={colors.accent.gold} />
            <Text style={styles.badgeText}>Next Hearing</Text>
          </View>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        {/* Case title */}
        <Text style={styles.caseTitle} numberOfLines={1}>
          {next.caseTitle || `Case #${next.caseNumber}`}
        </Text>

        {/* Case number */}
        {next.caseNumber ? (
          <Text style={styles.caseNumber} numberOfLines={1}>
            {next.caseNumber}
          </Text>
        ) : null}

        {/* Court */}
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {next.court || "Court not specified"}
          </Text>
        </View>

        {/* Courtroom */}
        {next.courtRoom ? (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.detailText}>Room {next.courtRoom}</Text>
          </View>
        ) : null}

        {/* Judge */}
        {next.judge ? (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {next.judge}
            </Text>
          </View>
        ) : null}

        {/* Time */}
        <Text style={styles.time}>{timeStr}</Text>

        {/* Open Case button */}
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleOpenCase}
          accessibilityRole="button"
          accessibilityLabel="Open case details"
          accessibilityHint="Navigate to the case detail screen"
        >
          <Text style={styles.actionText}>Open Case</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.text.inverse} />
        </Pressable>
      </View>
    </GlassCard>
  );
}


const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent.goldSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.md,
    gap: 4,
  },
  badgeText: {
    color: colors.accent.gold,
    fontWeight: "800",
    fontSize: typography.overline.fontSize,
    textTransform: "uppercase",
  },
  date: {
    color: colors.accent.gold,
    fontWeight: "800",
    fontSize: typography.caption.fontSize,
  },
  caseTitle: {
    color: colors.text.primary,
    fontWeight: "800",
    fontSize: typography.h3.fontSize,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
  },
  caseNumber: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
  },
  time: {
    color: colors.accent.gold,
    fontSize: typography.h4.fontSize,
    fontWeight: "800",
    lineHeight: typography.h4.lineHeight,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.accent.gold,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  actionText: {
    color: colors.text.inverse,
    fontWeight: "800",
    fontSize: typography.caption.fontSize,
    letterSpacing: typography.caption.letterSpacing,
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textAlign: "center",
  },
});
