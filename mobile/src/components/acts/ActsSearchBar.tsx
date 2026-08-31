// import React from "react";
import { StyleSheet, TextInput, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ActsSearchBar({
  value,
  onChange,
  placeholder = "Search acts...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={18} color="#B58D3D" style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
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
    borderColor: "rgba(181,141,61,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    padding: 0,
  },
});

