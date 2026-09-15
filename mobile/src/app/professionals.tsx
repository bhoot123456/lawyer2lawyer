import React from "react";
import { colors, radii, spacing, typography } from "@/theme/designSystem";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";

const PROFESSIONALS = [
  {
    key: "lawyer",
    title: "Lawyer",
    icon: "scale-outline" as const,
    description: "Representation, litigation strategy, drafting & legal advice.",
  },
  {
    key: "ca",
    title: "CA",
    icon: "calculator-outline" as const,
    description: "Accounting, tax computation, audits & compliance support.",
  },
  {
    key: "cs",
    title: "CS",
    icon: "document-text-outline" as const,
    description: "Company secretarial work, governance & statutory filings.",
  },
  {
    key: "tax-consultant",
    title: "Tax Consultant",
    icon: "receipt-outline" as const,
    description: "Tax planning, filings, notices and advisory for individuals & businesses.",
  },
];

export default function ProfessionalsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GlassCard borderColor={colors.border.gold} accent={colors.accent.gold}>
        <View style={styles.headerRow}>
          <View style={styles.badgeIcon}>
            <Ionicons name="people-outline" size={20} color={colors.accent.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Professionals</Text>
            <Text style={styles.subtitle}>
              Choose a professional category to get started.
            </Text>
          </View>
        </View>
      </GlassCard>

      <Text style={styles.sectionHeader}>Categories</Text>

      <View style={styles.cards}>
        {PROFESSIONALS.map((p) => (
          <Pressable
            key={p.key}
            style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
            onPress={() => {
              // Phase 9 landing only. Detail flow can be added later.
            }}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardIconWrap}>
                <Ionicons name={p.icon} size={20} color={colors.accent.gold} />
              </View>
              <Text style={styles.cardTitle}>{p.title}</Text>
            </View>
            <Text style={styles.cardDesc}>{p.description}</Text>
            <View style={styles.cardFooter}>
              <StatusBadge label="Coming Soon" variant="default" size="sm" />
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 18 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 110,
    backgroundColor: colors.bg.primary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.border.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    marginTop: 4,
    lineHeight: typography.caption.lineHeight,
  },
  sectionHeader: {
    color: colors.text.primary,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
  },
  cards: {
    gap: spacing.md,
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    backgroundColor: colors.bg.surface,
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: colors.accent.gold,
    fontWeight: typography.h4.fontWeight,
    fontSize: typography.h4.fontSize,
  },
  cardDesc: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
  },
  cardFooter: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
