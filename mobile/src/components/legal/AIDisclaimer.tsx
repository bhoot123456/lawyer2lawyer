import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

/**
 * AI disclaimer rendered on every AI-assisted screen.
 * Wording is conservative and must be reviewed by legal before release,
 * but the disclaimer itself is required product behaviour, not legal text.
 */
export default function AIDisclaimer() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        AI-generated responses provide general legal information only. They are
        not legal advice, may be inaccurate, and are not a substitute for a
        qualified lawyer.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.gold,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  text: { ...typography.caption, color: colors.text.secondary, lineHeight: 18 },
});
