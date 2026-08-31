import React, { memo, useMemo } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
} from "react-native";
import { AI_GOLD, AI_GOLD_DARK, AI_GOLD_LIGHT, AI_TEXT_PRIMARY, AI_BG } from "../constants";

interface AIButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const AIButton: React.FC<AIButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon,
  style,
}) => {
  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      damping: 15,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
    }).start();
  };

  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "danger" && styles.danger,
    isDisabled && styles.disabled,
    { transform: [{ scale: scaleAnim }] },
    style,
  ];

  return (
    <Animated.View style={buttonStyles}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        {loading ? (
          <ActivityIndicator color={variant === "secondary" ? AI_GOLD : "#FFFFFF"} size="small" />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.text,
                variant === "secondary" && styles.secondaryText,
                variant === "primary" && styles.primaryText,
                variant === "danger" && styles.dangerText,
                icon ? styles.textWithIcon : undefined,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  touchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: AI_GOLD,
    borderColor: AI_GOLD_DARK,
  },
  secondary: {
    backgroundColor: "transparent",
    borderColor: AI_GOLD_LIGHT,
  },
  danger: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  textWithIcon: {
    marginLeft: 8,
  },
  primaryText: {
    color: AI_BG,
  },
  secondaryText: {
    color: AI_GOLD,
  },
  dangerText: {
    color: "#EF4444",
  },
});

export default memo(AIButton);