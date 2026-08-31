import React from "react";
import { Text, View, StyleSheet } from "react-native";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

/**
 * App-level error boundary.
 * A single component/render failure must not blank the entire application
 * shell; the user gets a recoverable error state instead of a crash.
 */
export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Keep a console record for diagnostics without hiding the failure.
    console.error("AppErrorBoundary caught:", error?.message);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred. Please try again.
          </Text>
          <Text onPress={this.reset} style={styles.retry}>
            Tap to retry
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  message: { fontSize: 14, textAlign: "center", opacity: 0.7, marginBottom: 16 },
  retry: { fontSize: 15, fontWeight: "600", color: "#208AEF", padding: 8 },
});
