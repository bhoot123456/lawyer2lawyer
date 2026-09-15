import React, { useState } from "react";
import { Pressable, Platform, Text, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii, shadows } from "@/theme/designSystem";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type PremiumButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

const PremiumButton: React.FC<PremiumButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isDestructive = variant === "destructive";

  const backgroundColor = isPrimary
    ? colors.accent.gold
    : isDestructive
      ? colors.semantic.danger
      : isSecondary
        ? colors.bg.surface
        : "transparent";

  const textColor = isPrimary || isDestructive ? colors.text.inverse : colors.text.primary;
  const borderColor = isSecondary ? colors.border.default : "transparent";

  const paddingVertical = size === "lg" ? 14 : size === "sm" ? 8 : 12;
  const paddingHorizontal = size === "lg" ? 24 : size === "sm" ? 12 : 18;
  const fontSize = size === "lg" ? 16 : size === "sm" ? 13 : 14;
  const [hovered, setHovered] = useState(false);

  const isWeb = Platform.OS === "web";
  const hoverBg = isPrimary
    ? colors.accent.goldDark
    : isSecondary
      ? colors.bg.elevated
      : isDestructive
        ? "#DC2626"
        : colors.accent.goldSubtle;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityState={{ disabled: disabled || loading }}
      // @ts-expect-error — onMouseEnter/onMouseLeave are web-only props (react-native-web)
      onMouseEnter={isWeb ? () => setHovered(true) : undefined}
      onMouseLeave={isWeb ? () => setHovered(false) : undefined}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: hovered && isWeb && !disabled ? hoverBg : backgroundColor,
          borderColor: hovered && isWeb && isSecondary ? colors.accent.gold : borderColor,
          paddingVertical,
          paddingHorizontal,
          borderRadius: radii.lg,
          opacity: (disabled || loading) ? 0.5 : pressed ? 0.85 : 1,
          transform: pressed && !disabled ? [{ scale: 0.97 }] : [{ scale: 1 }],
          cursor: isWeb ? "pointer" : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <View style={styles.loadingDot} />
      ) : null}
      {icon && !loading ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize,
            fontWeight: "700",
            letterSpacing: 0.2,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    ...shadows.level1,
  },
  loadingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  iconWrap: {
    marginRight: 4,
  },
  text: {
    textAlign: "center",
  },
});

export default PremiumButton;
