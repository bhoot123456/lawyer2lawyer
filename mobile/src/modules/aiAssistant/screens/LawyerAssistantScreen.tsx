import React, { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAIAssistant } from "../hooks/useAIAssistant";
import {
  AIHeader,
  AIInput,
  AIButton,
  LoadingCard,
  ErrorCard,
  EmptyState,
} from "../components";
import {
  AI_BG,
  AI_GOLD,
  AI_GOLD_LIGHT,
  AI_CARD_BG,
  AI_TEXT_PRIMARY,
  AI_TEXT_SECONDARY,
  AI_TEXT_MUTED,
} from "../constants";
import type { FindLawyersResponse } from "../types";

const LawyerAssistantScreen: React.FC = () => {
  const [specialization, setSpecialization] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const { loading, error, data, findLawyers, clearError } = useAIAssistant("find-lawyers");
  const result = data as FindLawyersResponse | null;

  const handleSearch = useCallback(() => {
    const trimmedSpecialization = specialization.trim();
    const trimmedState = state.trim();
    const trimmedCity = city.trim();

    if (!trimmedSpecialization && !trimmedState && !trimmedCity) {
      Alert.alert("Missing Input", "Please enter a specialization, state, or city to find a lawyer.");
      return;
    }

    findLawyers({
      specialization: trimmedSpecialization || undefined,
      state: trimmedState || undefined,
      city: trimmedCity || undefined,
    });
  }, [city, findLawyers, specialization, state]);

  return (
    <View style={styles.container}>
      <AIHeader title="Lawyer Assistant" subtitle="Find lawyers by specialization and location" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroCard}>
          <Ionicons name="people-outline" size={24} color={AI_GOLD} />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Find the right legal support</Text>
            <Text style={styles.heroSubtitle}>
              Search for verified lawyers by practice area, state, and city.
            </Text>
          </View>
        </View>

        <AIInput
          label="Specialization"
          value={specialization}
          onChangeText={setSpecialization}
          placeholder="e.g. family, corporate, criminal"
        />
        <AIInput
          label="State"
          value={state}
          onChangeText={setState}
          placeholder="e.g. Gujarat"
        />
        <AIInput
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Noida"
        />

        <AIButton
          title={loading ? "Finding Lawyers..." : "Find Lawyers"}
          onPress={handleSearch}
          loading={loading}
        />

        {loading && <LoadingCard />}
        {error && <ErrorCard message={error} onRetry={handleSearch} onDismiss={clearError} />}

        {result && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Suggested matches</Text>
              <Text style={styles.summaryText}>{result.summary}</Text>
              <Text style={styles.resultCount}>
                {result.totalResults} lawyer(s) matched “{result.query}”
              </Text>
            </View>

            {result.results.map((lawyer) => (
              <View key={lawyer.id} style={styles.lawyerCard}>
                <View style={styles.lawyerHeader}>
                  <Ionicons name="briefcase-outline" size={18} color={AI_GOLD} />
                  <Text style={styles.lawyerName}>{lawyer.name}</Text>
                </View>

                <Text style={styles.lawyerMeta}>{lawyer.specialization}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Ionicons name="location-outline" size={14} color={AI_GOLD} />
                    <Text style={styles.metaText}>{lawyer.city}, {lawyer.state}</Text>
                  </View>
                  {lawyer.phone ? (
                    <View style={styles.metaPill}>
                      <Ionicons name="call-outline" size={14} color={AI_GOLD} />
                      <Text style={styles.metaText}>{lawyer.phone}</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.lawyerAbout} numberOfLines={4}>
                  {lawyer.about || "Profile details will appear here once the lawyer has added a short introduction."}
                </Text>
              </View>
            ))}
          </>
        )}

        {!loading && !error && !result && (
          <EmptyState
            icon="search-outline"
            title="Start a lawyer search"
            subtitle="Use specialization, state, or city to discover nearby legal experts."
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AI_BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: AI_TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroSubtitle: {
    color: AI_TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  summaryTitle: {
    color: AI_GOLD,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryText: {
    color: AI_TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  resultCount: {
    color: AI_TEXT_MUTED,
    fontSize: 12,
    fontWeight: "600",
  },
  lawyerCard: {
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  lawyerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  lawyerName: {
    color: AI_TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  lawyerMeta: {
    color: AI_GOLD,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(181, 141, 61, 0.12)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaText: {
    color: AI_TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "600",
  },
  lawyerAbout: {
    color: AI_TEXT_MUTED,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default memo(LawyerAssistantScreen);
