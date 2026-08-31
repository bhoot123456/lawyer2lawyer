import React, { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radii, shadows } from "@/theme/designSystem";

const DEFAULT_RADIUS = radii.lg;

export type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderColor?: string;
  accent?: string;
  onPress?: () => void;
  elevation?: 0 | 1 | 2 | 3 | 4;
};

function GlassContent({
  children,
  style,
  borderColor,
  contentStyle,
  elevation = 2,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor: string;
  contentStyle?: StyleProp<ViewStyle>;
  elevation: 0 | 1 | 2 | 3 | 4;
}) {
  const shadow = shadows[`level${elevation}` as keyof typeof shadows];

  return (
    <View
      style={[
        styles.cardBase,
        {
          borderRadius: DEFAULT_RADIUS,
          borderColor,
          backgroundColor: colors.bg.elevated,
          ...shadow,
        },
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
      <View style={[styles.rim, { pointerEvents: "none" }]} />
    </View>
  );
}

export default function GlassCard({
  children,
  style,
  contentStyle,
  borderColor = colors.border.gold,
  accent = colors.accent.gold,
  onPress,
  elevation = 2,
}: GlassCardProps) {
  const card = (
    <GlassContent
      style={[{ borderRadius: DEFAULT_RADIUS }, style]}
      borderColor={borderColor}
      elevation={elevation}
    >
      {children}
    </GlassContent>
  );

  if (!onPress) return card;

  return (
    <View style={styles.pressWrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          StyleSheet.absoluteFill,
          { borderRadius: DEFAULT_RADIUS },
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        <View
          style={[
            styles.accentGlow,
            { borderRadius: DEFAULT_RADIUS, borderColor: accent },
          ]}
        />
      </Pressable>
      <View style={{ margin: 0 }}>{card}</View>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1.5,
          backgroundColor: accent,
          opacity: 0.25,
          borderBottomLeftRadius: DEFAULT_RADIUS,
          borderBottomRightRadius: DEFAULT_RADIUS,
          pointerEvents: "none",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    position: "relative",
    margin: 0,
  },
  cardBase: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
  },
  content: {
    padding: 16,
  },
  rim: {
    position: "absolute",
    inset: 0,
    borderRadius: DEFAULT_RADIUS,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    pointerEvents: "none",
  },
  accentGlow: {
    position: "absolute",
    top: -1,
    bottom: -1,
    left: -1,
    right: -1,
    borderWidth: 1,
    opacity: 0.08,
  },
  shadow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: DEFAULT_RADIUS + 10,
    opacity: 0.0,
  },
});

