import React, { memo } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { AI_GOLD, AI_GOLD_LIGHT, AI_BG, AI_TEXT_PRIMARY, AI_TEXT_SECONDARY, AI_TEXT_MUTED } from "../constants";

interface AIInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  multiline?: boolean;
}

const AIInput: React.FC<AIInputProps> = ({
  label,
  error,
  containerStyle,
  multiline,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error ? styles.inputError : undefined,
          style,
        ]}
        placeholderTextColor={AI_TEXT_MUTED}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    color: AI_TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: AI_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: AI_TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "500",
  },
  multiline: {
    minHeight: 100,
    paddingTop: 12,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
});

export default memo(AIInput);