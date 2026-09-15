import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import type { AdvocateProfile } from "./types";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

interface DashboardHeaderProps {
  profile: AdvocateProfile;
}

const GOLD = colors.accent.gold;
const TEXT_PRIMARY = colors.text.primary;
const TEXT_SECONDARY = colors.text.secondary;

function getGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ profile }) => {
  const [currentTime, setCurrentTime] = useState(formatTime());
  const [currentDate, setCurrentDate] = useState(formatDate());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(formatTime(now));
      setCurrentDate(formatDate(now));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const displayName = typeof profile?.name === "string" && profile.name.trim()
    ? profile.name.trim()
    : "Advocate";

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <GlassCard borderColor={colors.border.gold} accent={GOLD} elevation={3}>
      <View style={styles.container}>
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            )}
            {profile?.isOnline && <View style={styles.onlineIndicator} />}
          </View>

          <View style={styles.profileText}>
            <Text style={styles.eyebrowText}>ADVOCATE</Text>
            <Text style={styles.greetingText}>
              {getGreeting()} {displayName.split(" ")[0]}
            </Text>
            <Text style={styles.enrollmentText}>
              Enrollment: {profile?.enrollmentNumber || "N/A"}
            </Text>
            {profile?.courtName ? (
              <Text style={styles.courtText}>{profile.courtName}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.dateTimeRow}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color={GOLD} />
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color={GOLD} />
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...shadows.level2,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
  },
  avatarText: {
    color: colors.text.inverse,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.semantic.success,
    borderWidth: 2,
    borderColor: colors.bg.elevated,
  },
  profileText: {
    flex: 1,
  },
  eyebrowText: {
    color: GOLD,
    fontSize: typography.overline.fontSize,
    fontWeight: typography.overline.fontWeight,
    lineHeight: typography.overline.lineHeight,
    letterSpacing: typography.overline.letterSpacing,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  greetingText: {
    color: TEXT_PRIMARY,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    lineHeight: typography.h2.lineHeight,
    letterSpacing: typography.h2.letterSpacing,
    marginBottom: 4,
  },
  enrollmentText: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
    marginBottom: 2,
  },
  courtText: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.goldLight,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dateText: {
    color: TEXT_SECONDARY,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  timeText: {
    color: GOLD,
    fontSize: typography.body.fontSize,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

export default DashboardHeader;