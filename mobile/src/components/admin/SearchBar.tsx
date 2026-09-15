import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/designSystem";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export default function SearchBar({ value, onChangeText, placeholder = "Search...", onClear }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color="#64748B" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear || (() => onChangeText(""))} style={styles.clearBtn}>
          <Ionicons name="close-circle-outline" size={18} color="#64748B" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 18, 20, 0.7)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    paddingHorizontal: 12,
    height: 46,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "600",
    height: "100%",
  },
  clearBtn: {
    padding: 4,
  },
});