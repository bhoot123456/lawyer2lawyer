import React, { memo } from "react";
import { colors } from "@/theme/designSystem";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  AI_GOLD,
  AI_GOLD_LIGHT,
  AI_BG,
  AI_CARD_BG,
  AI_TEXT_PRIMARY,
  AI_TEXT_SECONDARY,
  AI_FEATURES,
} from "../constants";
import { FeatureCard } from "../components";
import AIDisclaimer from "@/components/legal/AIDisclaimer";
import StatusBadge from "@/components/ui/StatusBadge";

const AILegalAssistantScreen: React.FC = () => {
  const openHistory = () => {
    router.push("/ai-history" as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerIconRow}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="sparkles-outline" size={28} color={AI_GOLD} />
            </View>
          </View>
          <Text style={styles.title}>AI Legal Assistant</Text>
          <Text style={styles.subtitle}>Your Personal Legal Intelligence</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>AI TOOLS</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.comingSoonNote}>
          These specialized tools are coming soon. For immediate help, use the
          AI Assistant chat (sparkle bubble) for legal research and drafting.
        </Text>

        {/* Feature Cards (visually deactivated until backend wiring lands) */}
        <View style={styles.featuresList} accessibilityLabel="AI tools coming soon">
          {AI_FEATURES.map((feature) => (
            <View
              key={feature.key}
              style={styles.soonCardWrap}
              accessibilityRole="text"
              accessibilityLabel={`${feature.title}, coming soon`}
              accessibilityState={{ disabled: true }}
            >
              <View style={styles.soonCardInner} pointerEvents="none">
                <FeatureCard
                  title={feature.title}
                  subtitle={feature.subtitle}
                  icon={feature.icon}
                  index={0}
                  onPress={() => undefined}
                  disabled
                />
              </View>
              <View style={styles.soonBadgeRow} pointerEvents="none">
                <StatusBadge label="Soon" variant="default" />
              </View>
            </View>
          ))}
        </View>

        {/* History Button (whole row is pressable) */}
        <View style={styles.historyContainer}>
          <Pressable
            style={({ pressed }) => [styles.historyCard, pressed && styles.historyCardPressed]}
            onPress={openHistory}
            accessibilityRole="button"
            accessibilityLabel="View History and Saved Results"
            accessibilityHint="Opens AI history and saved results"
          >
            <Ionicons name="time-outline" size={22} color={AI_GOLD} />
            <Text style={styles.historyText}>View History & Saved Results</Text>
            <Ionicons name="chevron-forward" size={18} color={AI_GOLD_LIGHT} />
          </Pressable>
        </View>

        {/* AI Disclaimer */}
        <AIDisclaimer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AI_BG,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  headerIconRow: {
    marginBottom: 12,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
  },
  title: {
    color: AI_TEXT_PRIMARY,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    color: AI_TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: AI_TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "500",
  },
  searchBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AI_GOLD,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  searchBadgeText: {
    color: AI_BG,
    fontSize: 12,
    fontWeight: "800",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AI_GOLD_LIGHT,
  },
  dividerText: {
    color: AI_GOLD,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginHorizontal: 12,
  },
  comingSoonNote: {
    color: AI_TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  featuresList: {
    marginBottom: 16,
  },
  soonCardWrap: {
    position: "relative",
    opacity: 0.5,
    marginBottom: 10,
  },
  soonCardInner: {
    width: "100%",
  },
  soonBadgeRow: {
    position: "absolute",
    top: 10,
    right: 12,
  },
  historyContainer: {
    marginTop: 8,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    minHeight: 52,
  },
  historyCardPressed: {
    opacity: 0.85,
  },
  historyText: {
    flex: 1,
    color: AI_TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default memo(AILegalAssistantScreen);