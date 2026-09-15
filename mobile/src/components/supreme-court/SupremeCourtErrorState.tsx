import React from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SupremeCourtErrorStateProps {
  message?: string;
  onRetry: () => void;
}

/**
 * SupremeCourtErrorState – Displayed when the API call fails, with a retry button.
 */
const SupremeCourtErrorState: React.FC<SupremeCourtErrorStateProps> = ({
  message,
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="cloud-offline-outline" size={40} color="#EF4444" />
      </View>
      <Text style={styles.title}>Something Went Wrong</Text>
      <Text style={styles.message}>
        {message || "Unable to load court list. Please check your connection and try again."}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        activeOpacity={0.8}
        accessibilityLabel="Retry loading court list"
        accessibilityRole="button"
      >
        <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    color: "rgba(248, 250, 252, 0.6)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.accent.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});

export default SupremeCourtErrorState;