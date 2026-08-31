import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import type { TimelineItem } from "./types";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

interface TodayTimelineProps {
  items: TimelineItem[];
  loading?: boolean;
  error?: string | null;
}

const GOLD = colors.accent.gold;
const TEXT_PRIMARY = colors.text.primary;
const TEXT_SECONDARY = colors.text.secondary;
const ERROR_RED = colors.semantic.danger;

const TimelineIcon: React.FC<{ type: TimelineItem["type"] }> = ({ type }) => {
  const getIcon = () => {
    switch (type) {
      case "hearing":
        return "time-outline";
      case "meeting":
        return "people-outline";
      case "draft":
        return "document-text-outline";
      case "call":
        return "call-outline";
      case "reminder":
        return "alarm-outline";
      default:
        return "calendar-outline";
    }
  };

  return (
    <View style={styles.timelineIconContainer}>
      <Ionicons name={getIcon() as any} size={18} color={GOLD} />
    </View>
  );
};

const TimelineEntry: React.FC<{ item: TimelineItem }> = ({ item }) => {
  return (
    <View style={styles.timelineEntry}>
      <TimelineIcon type={item.type} />
      <View style={styles.timelineContent}>
        <Text style={styles.timelineTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.timelineSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}
      </View>
      {item.time && (
        <Text style={styles.timelineTime}>{item.time}</Text>
      )}
    </View>
  );
};

const TodayTimeline: React.FC<TodayTimelineProps> = ({
  items,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Today&apos;s Timeline</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading timeline...</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Today&apos;s Timeline</Text>
        <GlassCard borderColor="rgba(239, 68, 68, 0.3)" accent={ERROR_RED} elevation={1}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color={ERROR_RED} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Today&apos;s Timeline</Text>
        <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={32} color={GOLD} />
            <Text style={styles.emptyText}>Nothing scheduled for today</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>Today&apos;s Timeline</Text>
      <GlassCard borderColor={colors.border.goldLight} accent={GOLD} elevation={1}>
        <View style={styles.timelineContainer}>
          {items.slice(0, 5).map((item, index) => (
            <React.Fragment key={item.id}>
              <TimelineEntry item={item} />
              {index < items.length - 1 && <View style={styles.timelineDivider} />}
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
  timelineContainer: {
    paddingVertical: spacing.xs,
  },
  timelineEntry: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  timelineIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    color: TEXT_PRIMARY,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    lineHeight: typography.h4.lineHeight,
  },
  timelineSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
    marginTop: 2,
  },
  timelineTime: {
    color: GOLD,
    fontSize: typography.caption.fontSize,
    fontWeight: "800",
  },
  timelineDivider: {
    height: 1,
    backgroundColor: colors.border.goldLight,
    marginLeft: 46,
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

export default TodayTimeline;