import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

/**
 * App-level error boundary.
 * A single component/render failure must not blank the entire application
 * shell; the user gets a recoverable, styled error state instead of a crash.
 */
export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Keep a diagnostic record without crashing the application shell
    console.error("AppErrorBoundary caught render error:", error?.message, errorInfo?.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              An unexpected error occurred in this view. You can retry or navigate to another section.
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Retry"
              onPress={this.reset}
              style={styles.retryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.bg.primary,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: "center",
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.accent.gold,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.text.inverse,
  },
});
