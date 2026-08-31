import React, { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAIAssistant } from "../hooks/useAIAssistant";
import { AIHeader, AIInput, AIButton, LoadingCard, ErrorCard, EmptyState } from "../components";
import { AI_BG, AI_GOLD, AI_GOLD_LIGHT, AI_CARD_BG, AI_TEXT_PRIMARY, AI_TEXT_SECONDARY, AI_TEXT_MUTED } from "../constants";
import type { SearchDocumentsResponse } from "../types";

const SearchDocumentsScreen: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const { loading, error, data, searchLegalDocuments, clearError } = useAIAssistant("search-documents");
  const result = data as SearchDocumentsResponse | null;

  const handleSearch = useCallback(() => {
    if (!keyword.trim()) {
      Alert.alert("Missing Input", "Please enter a search keyword");
      return;
    }
    searchLegalDocuments({ keyword });
  }, [keyword, searchLegalDocuments]);

  return (
    <View style={styles.container}>
      <AIHeader title="Search Documents" subtitle="Find relevant legal documents" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <AIInput label="Search Keyword" value={keyword} onChangeText={setKeyword} placeholder="e.g., bail, injunction, divorce..." />

        <AIButton title={loading ? "Searching..." : "Search"} onPress={handleSearch} loading={loading} />

        {loading && <LoadingCard />}
        {error && <ErrorCard message={error} onRetry={handleSearch} onDismiss={clearError} />}

        {result && result.results.length > 0 && (
          <>
            <Text style={styles.resultCount}>{result.totalResults} result(s) found for &quot;{result.query}&quot;</Text>
            {result.results.map((doc) => (
              <View key={doc.id} style={styles.documentCard}>
                <View style={styles.docHeader}>
                  <Ionicons name="document-text-outline" size={20} color={AI_GOLD} />
                  <Text style={styles.docTitle} numberOfLines={2}>{doc.title}</Text>
                  <View style={styles.relevanceBadge}>
                    <Text style={styles.relevanceText}>{doc.relevance}%</Text>
                  </View>
                </View>
                <Text style={styles.docMatch} numberOfLines={3}>{doc.matchedText}</Text>
                <TouchableOpacity style={styles.openButton}>
                  <Text style={styles.openButtonText}>Open Document</Text>
                  <Ionicons name="open-outline" size={14} color={AI_GOLD} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {result && result.results.length === 0 && (
          <EmptyState icon="search-outline" title="No results found" subtitle="Try a different keyword" />
        )}

        {!loading && !error && !result && (
          <EmptyState icon="search-outline" title="Enter a keyword above" subtitle="Search through legal documents and find relevant passages" />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AI_BG },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  resultCount: { color: AI_TEXT_SECONDARY, fontSize: 13, fontWeight: "600", marginBottom: 12 },
  documentCard: {
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  docHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  docTitle: {
    flex: 1,
    color: AI_TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "700",
  },
  relevanceBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  relevanceText: {
    color: "#22C55E",
    fontSize: 11,
    fontWeight: "700",
  },
  docMatch: {
    color: AI_TEXT_MUTED,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  openButtonText: {
    color: AI_GOLD,
    fontSize: 13,
    fontWeight: "700",
  },
});

export default memo(SearchDocumentsScreen);