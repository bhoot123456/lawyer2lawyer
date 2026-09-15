import React, { memo, useEffect, useMemo, useState } from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet, Animated, TouchableOpacity, AccessibilityInfo } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AI_GOLD, AI_GOLD_LIGHT, AI_BG, AI_CARD_BG, AI_TEXT_PRIMARY, AI_TEXT_SECONDARY } from "../constants";

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  index?: number;
  disabled?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, subtitle, icon, onPress, index = 0, disabled = false }) => {
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      fadeAnim.setValue(1);
      return;
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [index, fadeAnim, reduceMotion]);

  const handlePressIn = () => {
    if (reduceMotion) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      damping: 15,
    }).start();
  };

  const handlePressOut = () => {
    if (reduceMotion) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        activeOpacity={disabled ? 1 : 0.9}
        style={styles.card}
        accessibilityRole={disabled ? "text" : "button"}
        accessibilityState={{ disabled }}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={28} color={AI_GOLD} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={AI_GOLD_LIGHT} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    borderRadius: 16,
    padding: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: AI_TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 3,
  },
  subtitle: {
    color: AI_TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default memo(FeatureCard);