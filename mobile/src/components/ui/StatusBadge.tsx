import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

type StatusVariant = "success" | "warning" | "danger" | "info" | "gold" | "default";

type StatusBadgeProps = {
  label: string;
  variant?: StatusVariant;
  dot?: boolean;
  size?: "sm" | "md";
};

const STATUS_MAP: Record<StatusVariant, { bg: string; text: string; dot: string }> = {
  success: {
    bg: colors.semantic.successSubtle,
    text: colors.semantic.success,
    dot: colors.semantic.success,
  },
  warning: {
    bg: colors.semantic.warningSubtle,
    text: colors.semantic.warning,
    dot: colors.semantic.warning,
  },
  danger: {
    bg: colors.semantic.dangerSubtle,
    text: colors.semantic.danger,
    dot: colors.semantic.danger,
  },
  info: {
    bg: colors.semantic.infoSubtle,
    text: colors.semantic.info,
    dot: colors.semantic.info,
  },
  gold: {
    bg: colors.accent.goldSubtle,
    text: colors.accent.gold,
    dot: colors.accent.gold,
  },
  default: {
    bg: colors.border.goldLight,
    text: colors.text.secondary,
    dot: colors.text.muted,
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = "default",
  dot = false,
  size = "sm",
}) => {
  const config = STATUS_MAP[variant];
  const isSm = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.text,
          paddingHorizontal: isSm ? spacing.sm : spacing.md,
          paddingVertical: isSm ? 4 : 6,
          borderRadius: radii.full,
          borderWidth: 0.5,
        },
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: config.dot }]} /> : null}
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSm ? typography.caption.fontSize : typography.body.fontSize,
            fontWeight: typography.caption.fontWeight,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    letterSpacing: 0.3,
  },
});

export default StatusBadge;
