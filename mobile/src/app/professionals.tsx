import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";

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
      <GlassCard borderColor="rgba(181, 141, 61, 0.35)" accent="#B58D3D">
        <View style={styles.headerRow}>
          <View style={styles.badgeIcon}>
            <Ionicons name="people-outline" size={20} color="#D4AF37" />
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
            style={({ pressed }) => [styles.card, pressed ? { opacity: 0.92 } : null]}
            onPress={() => {
              // Phase 9 landing only. Detail flow can be added later.
            }}
          >
            <View style={styles.cardTop}>
              <Ionicons
                name={p.icon}
                size={20}
                color="#D4AF37"
                style={styles.cardIcon}
              />
              <Text style={styles.cardTitle}>{p.title}</Text>
            </View>
            <Text style={styles.cardDesc}>{p.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardHint}>Coming soon</Text>
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
    padding: 16,
    gap: 14,
    paddingBottom: 110,
    backgroundColor: "#0B0B0B",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(181,141,61,0.12)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(248,250,252,0.75)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
    lineHeight: 16,
  },
  sectionHeader: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  cards: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.20)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardIcon: {
    marginTop: 1,
  },
  cardTitle: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 15,
  },
  cardDesc: {
    marginTop: 10,
    color: "rgba(248,250,252,0.80)",
    fontWeight: "800",
    fontSize: 12,
    lineHeight: 18,
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cardHint: {
    color: "rgba(248,250,252,0.65)",
    fontWeight: "900",
    fontSize: 12,
  },
});

