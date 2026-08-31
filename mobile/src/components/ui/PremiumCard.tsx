import React, { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii, shadows, spacing } from "@/theme/designSystem";

type ElevationLevel = 0 | 1 | 2 | 3 | 4;

type PremiumCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderColor?: string;
  accent?: string;
  onPress?: () => void;
  elevation?: ElevationLevel;
};

function PremiumCardInner({
  children,
  style,
  contentStyle,
  borderColor,
  accent,
  elevation = 2,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderColor: string;
  accent: string;
  elevation: ElevationLevel;
}) {
  const shadow = shadows[`level${elevation}` as keyof typeof shadows];
  const radius = elevation >= 3 ? radii.xl : radii.lg;

  return (
    <View
      style={[
        styles.cardBase,
        {
          borderRadius: radius,
          borderColor,
          ...shadow,
          backgroundColor: colors.bg.elevated,
        },
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
      {accent && elevation >= 2 ? (
        <View
          style={[
            styles.accentEdge,
            { borderColor: accent, borderRadius: radius },
          ]}
        />
      ) : null}
      {elevation >= 3 ? (
        <View
          style={[
            styles.innerGlow,
            { borderRadius: radius, borderColor: "rgba(255,255,255,0.03)" },
          ]}
        />
      ) : null}
    </View>
  );
}

export default function PremiumCard({
  children,
  style,
  contentStyle,
  borderColor = colors.border.gold,
  accent = colors.accent.gold,
  onPress,
  elevation = 2,
}: PremiumCardProps) {
  const card = (
    <PremiumCardInner
      style={style}
      contentStyle={contentStyle}
      borderColor={borderColor}
      accent={accent}
      elevation={elevation}
    >
      {children}
    </PremiumCardInner>
  );

  if (!onPress) return card;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressWrap,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    borderRadius: radii.lg,
  },
  cardBase: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
  },
  content: {
    padding: spacing.md,
  },
  accentEdge: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 1.5,
    opacity: 0.4,
    pointerEvents: "none",
  },
  innerGlow: {
    position: "absolute",
    inset: 0,
    borderWidth: 1,
    pointerEvents: "none",
  },
});
