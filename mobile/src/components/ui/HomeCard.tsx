import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

type HomeCardProps = {
  /** Card title displayed below the icon */
  title: string;
  /** Optional subtitle shown in smaller text */
  subtitle?: string;
  /** Ionicons icon name */
  icon: string;
  /** Icon tint color — defaults to gold accent */
  iconColor?: string;
  /** When true, renders a gold accent border (for premium cards like AI Assistant) */
  accent?: boolean;
  /** Pressed handler */
  onPress: () => void;
  /** Accessibility label — defaults to title */
  accessibilityLabel?: string;
};

/**
 * HomeCard — reusable grid card for the Home screen.
 *
 * Provides consistent radius, border, padding, icon treatment, typography,
 * and press states. Uses design-system tokens for theming.
 */
export default function HomeCard({
  title,
  subtitle,
  icon,
  iconColor = colors.accent.gold,
  accent = false,
  onPress,
  accessibilityLabel,
}: HomeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        accent ? styles.accentCard : null,
        pressed ? styles.pressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={subtitle ? `${title}. ${subtitle}` : `${title}. Navigate to ${title}.`}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <Text
        style={styles.title}
        numberOfLines={2}
        accessible={false}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={2} accessible={false}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.bg.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.level1,
  },
  accentCard: {
    borderColor: colors.accent.gold,
    borderWidth: 1.5,
    ...shadows.level2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    letterSpacing: typography.h4.letterSpacing,
    textAlign: "center",
    lineHeight: typography.h4.lineHeight,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});