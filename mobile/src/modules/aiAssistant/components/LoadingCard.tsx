import React, { memo, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AI_GOLD, AI_GOLD_LIGHT, AI_CARD_BG, AI_TEXT_SECONDARY } from "../constants";

const LoadingCard: React.FC = () => {
  const spinAnim = useMemo(() => new Animated.Value(0), []);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);
  const dotsAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const dots = Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dotsAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(dotsAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dotsAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(dotsAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dotsAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );

    spin.start();
    pulse.start();
    dots.start();

    return () => {
      spin.stop();
      pulse.stop();
      dots.stop();
    };
  }, [spinAnim, pulseAnim, dotsAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const dotOpacity = dotsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, { opacity: pulseAnim }]}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="sync-outline" size={40} color={AI_GOLD} />
        </Animated.View>
      </Animated.View>
      <View style={styles.textRow}>
        <Text style={styles.text}>AI is thinking</Text>
        {[0, 1, 2].map((i) => (
          <Animated.Text
            key={i}
            style={[
              styles.dot,
              {
                opacity: dotOpacity,
                // Stagger the animation for each dot
                transform: [
                  {
                    scale: dotsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1 + (i + 1) * 0.15],
                    }),
                  },
                ],
              },
            ]}
          >
            .
          </Animated.Text>
        ))}
      </View>
      <Text style={styles.subtext}>Generating your response...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(181, 141, 61, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  text: {
    color: AI_GOLD,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  dot: {
    color: AI_GOLD,
    fontSize: 24,
    fontWeight: "900",
    marginLeft: 1,
  },
  subtext: {
    color: AI_TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: "500",
  },
});

export default memo(LoadingCard);