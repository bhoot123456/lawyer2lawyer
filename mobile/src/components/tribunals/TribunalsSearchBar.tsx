import React, { useCallback } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
};

const TribunalsSearchBar = React.memo(function TribunalsSearchBar({
  value,
  onChange,
  placeholder = "Search tribunals, commissions, authorities...",
}: Props) {
  const [focused, setFocused] = React.useState(false);
  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  return (
    <View style={styles.container}>
      <View style={[styles.searchWrapper, focused && styles.searchWrapperFocused]}>
        <View style={styles.iconContainer}>
          <Ionicons name="search" size={18} color={colors.text.muted} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {value.length > 0 ? (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.text.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 52,
    ...shadows.level1,
  },
  searchWrapperFocused: {
    borderColor: colors.accent.gold,
    ...shadows.level2,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    paddingVertical: 0,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg.elevated,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
});

export default TribunalsSearchBar;