import React, { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  View,
  StyleSheet,
  ScrollViewProps,
  ViewStyle,
  KeyboardAvoidingViewProps,
} from "react-native";

type KeyboardAwareViewProps = {
  children: React.ReactNode;
  /** If true, wraps content in a ScrollView. Default: true */
  scrollable?: boolean;
  /** ScrollView content container style */
  contentContainerStyle?: ViewStyle;
  /** Additional style for the outer container */
  style?: ViewStyle;
  /** KeyboardAvoidingView behavior. Default: 'padding' on iOS, undefined on Android */
  behavior?: KeyboardAvoidingViewProps["behavior"];
  /** Keyboard vertical offset. Default: 0 */
  keyboardVerticalOffset?: number;
  /** ScrollView props to pass through */
  scrollViewProps?: Omit<ScrollViewProps, "contentContainerStyle">;
};

/**
 * KeyboardAwareView - A professional, reusable wrapper that:
 * - Uses KeyboardAvoidingView for iOS keyboard handling
 * - Uses ScrollView for scrollable forms with keyboardShouldPersistTaps="handled"
 *   which allows both TextInput focus and keyboard dismissal on tap
 * - Works consistently on both Android and iOS
 *
 * IMPORTANT: Do NOT wrap content with Pressable/TouchableWithoutFeedback onPress
 * as it blocks TextInput focus events. Instead, use ScrollView with
 * keyboardShouldPersistTaps="handled" which handles both scenarios.
 */
export const KeyboardAwareView: React.FC<KeyboardAwareViewProps> = ({
  children,
  scrollable = true,
  contentContainerStyle,
  style,
  behavior = Platform.OS === "ios" ? "padding" : undefined,
  keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0,
  scrollViewProps,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {scrollable ? (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.inner, contentContainerStyle]}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});