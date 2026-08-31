import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Animated,
  Keyboard,
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
  AI_TEXT_MUTED,
  AI_FEATURES,
} from "../constants";
import { FeatureCard } from "../components";
import AIDisclaimer from "@/components/legal/AIDisclaimer";

const AILegalAssistantScreen: React.FC = () => {
  const handleFeaturePress = useCallback((screen: string) => {
    Keyboard.dismiss();
    router.push(`/${screen}` as any);
  }, []);

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

        {/* Premium Search Box */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={AI_GOLD}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="COMMING SOON..."
            placeholderTextColor={AI_TEXT_MUTED}
            editable={false}
          />
          <View style={styles.searchBadge}>
            <Ionicons name="sparkles" size={14} color={AI_BG} />
            <Text style={styles.searchBadgeText}>AI</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>AI TOOLS</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresList}>
          {AI_FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.key}
              title={feature.title}
              subtitle={feature.subtitle}
              icon={feature.icon}
              onPress={() => handleFeaturePress(feature.screen)}
              index={index}
            />
          ))}
        </View>

        {/* History Button */}
        <View style={styles.historyContainer}>
          <Animated.View style={styles.historyCard}>
            <Ionicons name="time-outline" size={22} color={AI_GOLD} />
            <Text style={styles.historyText}>View History & Saved Results</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={AI_GOLD_LIGHT}
              onPress={() => router.push("/ai-history" as any)}
            />
          </Animated.View>
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
    backgroundColor: "rgba(181, 141, 61, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
  },
  title: {
    color: AI_TEXT_PRIMARY,
    fontSize: 26,
    fontWeight: "900",
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
    fontSize: 11,
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
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginHorizontal: 12,
  },
  featuresList: {
    marginBottom: 16,
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
  },
  historyText: {
    flex: 1,
    color: AI_TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default memo(AILegalAssistantScreen);