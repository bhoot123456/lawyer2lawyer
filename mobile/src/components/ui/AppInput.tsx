import React, { forwardRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

type AppInputVariant = "outlined" | "filled";
type AppInputSize = "sm" | "md" | "lg";

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  variant?: AppInputVariant;
  size?: AppInputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  passwordToggleAccessibilityLabel?: string;
  secureVisible?: boolean;
  onSecureVisibleChange?: (visible: boolean) => void;
};

const AppInput = forwardRef<TextInput, AppInputProps>(
  (
    {
      label,
      error,
      hint,
      variant = "outlined",
      size = "md",
      leftIcon,
      rightIcon,
      containerStyle,
      disabled = false,
      passwordToggleAccessibilityLabel,
      secureVisible,
      onSecureVisibleChange,
      secureTextEntry,
      style,
      ...textInputProps
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalSecure, setInternalSecure] = useState(secureTextEntry);
    const isSecureControlled = typeof secureVisible === "boolean";
    const isSecure = isSecureControlled ? !secureVisible : internalSecure;

    const isFilled = variant === "filled";
    const hasError = Boolean(error);

    const paddingVertical = size === "lg" ? 14 : size === "sm" ? 8 : 12;
    const fontSize = size === "lg" ? 16 : size === "sm" ? 14 : 15;

    const borderColor = hasError
      ? colors.semantic.danger
      : isFocused
        ? colors.accent.gold
        : isFilled
          ? "transparent"
          : colors.border.default;

    const backgroundColor = isFilled
      ? colors.bg.surface
      : "transparent";

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View
          style={[
            styles.inputWrapper,
            {
              borderColor,
              backgroundColor,
              borderRadius: radii.md,
              paddingVertical,
            },
            isFocused && styles.inputWrapperFocused,
          ]}
        >
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.text.muted}
            editable={!disabled}
            secureTextEntry={isSecure}
            onFocus={(e) => {
              setIsFocused(true);
              textInputProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              textInputProps.onBlur?.(e);
            }}
            style={[
              styles.input,
              {
                color: colors.text.primary,
                fontSize,
                opacity: disabled ? 0.5 : 1,
              },
              style,
            ]}
            {...textInputProps}
          />
          {secureTextEntry ? (
            <Pressable
              onPress={() => {
                if (isSecureControlled) {
                  onSecureVisibleChange?.(!secureVisible);
                } else {
                  setInternalSecure((prev) => !prev);
                }
              }}
              style={styles.iconRight}
              hitSlop={8}
              accessibilityLabel={
                passwordToggleAccessibilityLabel ??
                (!isSecure ? "Hide password" : "Show password")
              }
              accessibilityRole="button"
            >
              <Ionicons
                name={isSecure ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.text.muted}
              />
            </Pressable>
          ) : null}
          {rightIcon && !secureTextEntry ? (
            <View style={styles.iconRight}>{rightIcon}</View>
          ) : null}
        </View>
        {hasError ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : hint ? (
          <Text style={styles.hintText}>{hint}</Text>
        ) : null}
      </View>
    );
  },
);

AppInput.displayName = "AppInput";

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputWrapperFocused: {
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    padding: 0,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
  iconLeft: {
    marginRight: 2,
  },
  iconRight: {
    marginLeft: 2,
  },
  errorText: {
    color: colors.semantic.danger,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
  },
  hintText: {
    color: colors.text.muted,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
  },
});

export default AppInput;