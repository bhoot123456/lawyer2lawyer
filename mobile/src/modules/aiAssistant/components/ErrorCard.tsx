import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AI_GOLD, AI_GOLD_LIGHT, AI_CARD_BG, AI_ERROR_RED, AI_TEXT_SECONDARY } from "../constants";
import AIButton from "./AIButton";

interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ message, onRetry, onDismiss }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={36} color={AI_ERROR_RED} />
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.buttonRow}>
        {onRetry && <AIButton title="Retry" onPress={onRetry} variant="secondary" />}
        {onDismiss && (
          <AIButton title="Dismiss" onPress={onDismiss} variant="secondary" style={styles.dismissButton} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    color: AI_ERROR_RED,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  message: {
    color: AI_TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  dismissButton: {
    marginLeft: 8,
  },
});

export default memo(ErrorCard);