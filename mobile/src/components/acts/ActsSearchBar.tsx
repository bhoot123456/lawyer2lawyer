// import React from "react";
import { StyleSheet, TextInput, View, Text } from "react-native";
import { colors } from "@/theme/designSystem";
import { Ionicons } from "@expo/vector-icons";

export default function ActsSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search acts...",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={18} color={colors.accent.gold} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        accessibilityLabel="Search bare acts"
        accessibilityHint="Type to filter acts, then press search on the keyboard"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.gold,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#0F172A",
    padding: 0,
    minHeight: 44,
  },
});

