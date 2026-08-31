import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SupremeCourtEmptyStateProps {
  searchQuery?: string;
  activeFilter?: string;
}

/**
 * SupremeCourtEmptyState – Displayed when no court rooms match the current filters.
 */
const SupremeCourtEmptyState: React.FC<SupremeCourtEmptyStateProps> = ({
  searchQuery,
  activeFilter,
}) => {
  const hasFilters = !!searchQuery || (activeFilter && activeFilter !== "All");

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="search-outline" size={40} color="rgba(181, 141, 61, 0.4)" />
      </View>
      <Text style={styles.title}>
        {hasFilters ? "No Matching Courts" : "No Court Rooms Available"}
      </Text>
      <Text style={styles.subtitle}>
        {hasFilters
          ? "Try adjusting your search or filter to find what you're looking for."
          : "Court room data will appear here once available."}
      </Text>
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
    backgroundColor: "rgba(181, 141, 61, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(248, 250, 252, 0.6)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default SupremeCourtEmptyState;