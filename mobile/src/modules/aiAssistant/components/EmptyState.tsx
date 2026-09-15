import React, { memo } from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AI_GOLD, AI_CARD_BG, AI_TEXT_SECONDARY } from "../constants";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "bulb-outline",
  title,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={36} color={AI_GOLD} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    color: AI_TEXT_SECONDARY,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: AI_TEXT_SECONDARY,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.7,
  },
});

export default memo(EmptyState);