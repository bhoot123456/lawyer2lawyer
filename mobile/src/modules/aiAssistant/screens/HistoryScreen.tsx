import React, { memo, useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AIHeader, EmptyState, AIButton } from "../components";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AI_BG, AI_GOLD, AI_GOLD_LIGHT, AI_CARD_BG, AI_TEXT_PRIMARY, AI_TEXT_SECONDARY, AI_TEXT_MUTED } from "../constants";
import { loadHistory, deleteHistoryEntry, clearAllHistory, toggleBookmark } from "../utils/storage";
import type { AIHistoryEntry, AIFeature } from "../types";

const FEATURE_TITLES: Record<AIFeature, string> = {
  "draft-legal-notice": "Draft Legal Notice",
  "summarize-judgment": "Summarize Judgment",
  "explain-bare-act": "Explain Bare Act",
  "case-summary": "Case Summary",
  "search-documents": "Search Documents",
  "legal-checklist": "Legal Checklist",
  "find-lawyers": "Lawyer Assistant",
};

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<AIHistoryEntry[]>([]);
  const [filter, setFilter] = useState<"all" | AIFeature>("all");
  // Cross-platform confirm dialogs (Alert.alert is a no-op on web).
  const { confirm: confirmDialog, element: dialogElement } = useConfirmDialog();

  const refreshHistory = useCallback(async () => {
    const entries = await loadHistory();
    setHistory(entries);
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshHistory();
    })();
  }, [refreshHistory]);

  const filteredHistory = filter === "all" ? history : history.filter((e) => e.feature === filter);

  const handleDelete = useCallback(async (id: string) => {
    const ok = await confirmDialog({
      title: "Delete Entry",
      message: "Are you sure you want to delete this history entry?",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    await deleteHistoryEntry(id);
    refreshHistory();
  }, [confirmDialog, refreshHistory]);

  const handleToggleBookmark = useCallback(async (id: string) => {
    await toggleBookmark(id);
    refreshHistory();
  }, [refreshHistory]);

  const handleClearAll = useCallback(async () => {
    const ok = await confirmDialog({
      title: "Clear History",
      message: "Are you sure you want to clear all history?",
      confirmLabel: "Clear All",
      danger: true,
    });
    if (!ok) return;
    await clearAllHistory();
    setHistory([]);
  }, [confirmDialog]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFeatureIcon = (feature: AIFeature): string => {
    const icons: Record<AIFeature, string> = {
      "draft-legal-notice": "document-text-outline",
      "summarize-judgment": "scale-outline",
      "explain-bare-act": "book-outline",
      "case-summary": "briefcase-outline",
      "search-documents": "search-outline",
      "legal-checklist": "checkmark-circle-outline",
      "find-lawyers": "people-outline",
    };
    return icons[feature];
  };

  return (
    <View style={styles.container}>
      <AIHeader
        title="History"
        subtitle="Saved AI assistant results"
        rightAction={history.length > 0 ? { icon: "trash-outline", onPress: handleClearAll } : undefined}
      />

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {Object.entries(FEATURE_TITLES).map(([key, title]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterChip, filter === key && styles.filterChipActive]}
            onPress={() => setFilter(key as AIFeature)}
          >
            <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {filteredHistory.length === 0 ? (
          <EmptyState icon="time-outline" title="No history yet" subtitle="Your AI assistant results will appear here" />
        ) : (
          filteredHistory.map((entry) => (
            <View key={entry.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Ionicons name={getFeatureIcon(entry.feature) as any} size={18} color={AI_GOLD} />
                <Text style={styles.historyFeature}>{FEATURE_TITLES[entry.feature]}</Text>
                <TouchableOpacity onPress={() => handleToggleBookmark(entry.id)}>
                  <Ionicons
                    name={entry.isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={18}
                    color={entry.isBookmarked ? AI_GOLD : AI_TEXT_MUTED}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.historyPrompt} numberOfLines={2}>{entry.prompt}</Text>
              <Text style={styles.historyDate}>{formatDate(entry.createdAt)}</Text>
              <View style={styles.historyActions}>
                <TouchableOpacity style={styles.historyAction} onPress={() => handleDelete(entry.id)}>
                  <Ionicons name="trash-outline" size={14} color={AI_TEXT_MUTED} />
                  <Text style={styles.historyActionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {dialogElement}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AI_BG },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, maxHeight: 50 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: AI_GOLD, borderColor: AI_GOLD_LIGHT },
  filterText: { color: AI_TEXT_SECONDARY, fontSize: 12, fontWeight: "600" },
  filterTextActive: { color: AI_BG, fontWeight: "800" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  historyCard: {
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  historyFeature: { color: AI_GOLD, fontSize: 12, fontWeight: "700", flex: 1 },
  historyPrompt: { color: AI_TEXT_PRIMARY, fontSize: 12, lineHeight: 18, marginBottom: 6 },
  historyDate: { color: AI_TEXT_MUTED, fontSize: 11 },
  historyActions: { flexDirection: "row", gap: 16, marginTop: 8 },
  historyAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  historyActionText: { color: AI_TEXT_MUTED, fontSize: 12, fontWeight: "600" },
});

export default memo(HistoryScreen);