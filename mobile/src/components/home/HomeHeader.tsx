import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@/theme/designSystem";
import GlassCard from "@/components/ui/GlassCard";
import { getGreeting } from "@/services/dashboardApi";
import type { AdvocateProfile } from "@/components/dashboard/types";

interface HomeHeaderProps {
  profile: AdvocateProfile;
}

/**
 * HomeHeader — compact, restrained advocate greeting for the Daily CourtDesk.
 *
 * Shows a time-of-day greeting, the advocate's name (sourced from the
 * existing advocate profile), a Delhi-courts context line, and a live
 * date/time ticker. Deliberately lighter than DashboardHeader: no avatar,
 * no enrollment number, no online dot — this is a quick daily-brief header,
 * not a profile workspace.
 */
export default function HomeHeader({ profile }: HomeHeaderProps) {
  const [dateTime, setDateTime] = useState<{ date: string; time: string }>(
    () => formatNow(new Date()),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(formatNow(new Date()));
    }, 60000); // tick every minute
    return () => clearInterval(interval);
  }, []);

  const greeting = getGreeting();
  const name = profile?.name?.trim() || "Advocate";

  return (
    <GlassCard
      borderColor={colors.border.gold}
      accent={colors.accent.gold}
      elevation={2}
    >
      <View style={styles.container}>
        <View style={styles.greetings}>
          <Text style={styles.eyebrow}>{greeting.toUpperCase()}</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.context}>Delhi Courts</Text>
        </View>
        <View style={styles.dateTime}>
          <Text style={styles.date}>{dateTime.date}</Text>
          <Text style={styles.time}>{dateTime.time}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

function formatNow(now: Date): { date: string; time: string } {
  return {
    date: now.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    time: now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  greetings: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: colors.accent.goldDark,
    fontSize: typography.overline.fontSize,
    fontWeight: typography.overline.fontWeight,
    letterSpacing: typography.overline.letterSpacing,
    textTransform: "uppercase",
  },
  name: {
    color: colors.text.primary,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    lineHeight: typography.h2.lineHeight,
    letterSpacing: typography.h2.letterSpacing,
  },
  context: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
  },
  dateTime: {
    alignItems: "flex-end",
    gap: 2,
  },
  date: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
  },
  time: {
    color: colors.accent.gold,
    fontSize: typography.body.fontSize,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
