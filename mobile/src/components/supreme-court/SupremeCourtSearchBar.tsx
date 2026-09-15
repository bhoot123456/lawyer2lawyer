import React, { useCallback, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SupremeCourtSearchBarProps } from "@/types/supremeCourt";
import { colors } from "@/theme/designSystem";

/**
 * SupremeCourtSearchBar – Search input for filtering court rooms by number.
 */
const SupremeCourtSearchBar: React.FC<SupremeCourtSearchBarProps> = ({
  value,
  onChangeText,
  onClear,
}) => {
  const inputRef = useRef<TextInput>(null);

  const handleClear = useCallback(() => {
    onClear();
    inputRef.current?.blur();
  }, [onClear]);

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search Court Room..."
          placeholderTextColor="rgba(248, 250, 252, 0.35)"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search court room"
          accessibilityRole="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" size={18} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    paddingHorizontal: 14,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "600",
    height: "100%",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
});

export default SupremeCourtSearchBar;