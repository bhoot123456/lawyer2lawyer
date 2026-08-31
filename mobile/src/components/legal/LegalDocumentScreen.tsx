import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

export interface LegalSection {
  heading: string;
  body: string;
}

interface LegalDocumentScreenProps {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

/**
 * Shared renderer for legal documents (Privacy Policy, Terms of Service).
 *
 * NOTE: The wording shipped here is ENGINEERING DRAFT TEXT produced without
 * legal counsel. It must be reviewed and replaced/approved by a qualified
 * lawyer before any public store release. The banner below is intentional
 * and must remain until that approval is obtained.
 */
export default function LegalDocumentScreen({
  title,
  lastUpdated,
  sections,
}: LegalDocumentScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.updated}>Last updated: {lastUpdated}</Text>

      <View style={styles.draftBanner}>
        <Text style={styles.draftBannerText}>
          DRAFT DOCUMENT — pending legal review. This text has not been
          approved by a lawyer and must be reviewed before public release.
        </Text>
      </View>

      {sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={styles.heading}>{section.heading}</Text>
          <Text style={styles.body}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xs },
  updated: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.md },
  draftBanner: {
    backgroundColor: "#FEF3C7",
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  draftBannerText: { ...typography.caption, color: "#92400E", fontWeight: "600" },
  section: { marginBottom: spacing.lg },
  heading: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs },
  body: { ...typography.body, color: colors.text.secondary, lineHeight: 20 },
});
