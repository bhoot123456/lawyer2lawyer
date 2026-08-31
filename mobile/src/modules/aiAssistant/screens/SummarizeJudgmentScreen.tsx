import React, { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useAIAssistant } from "../hooks/useAIAssistant";
import { AIHeader, AIInput, AIButton, AIResultCard, ResultSection, LoadingCard, ErrorCard, EmptyState, ActionButtons } from "../components";
import { AI_BG } from "../constants";
import type { SummarizeJudgmentResponse } from "../types";

const SummarizeJudgmentScreen: React.FC = () => {
  const [judgmentText, setJudgmentText] = useState("");
  const { loading, error, data, summarizeJudgment, clearError } = useAIAssistant("summarize-judgment");
  const result = data as SummarizeJudgmentResponse | null;

  const handleGenerate = useCallback(() => {
    if (!judgmentText.trim()) {
      Alert.alert("Missing Input", "Please paste the judgment text");
      return;
    }
    summarizeJudgment({ judgmentText });
  }, [judgmentText, summarizeJudgment]);

  const resultText = result
    ? `Facts:\n${result.facts}\n\nIssues:\n${result.issues}\n\nCourt Findings:\n${result.courtFindings}\n\nDecision:\n${result.decision}\n\nKey Observations:\n${result.keyObservations}\n\nRatio Decidendi:\n${result.ratioDecidendi}`
    : "";

  return (
    <View style={styles.container}>
      <AIHeader title="Summarize Judgment" subtitle="Get concise judgment summaries" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <AIInput label="Paste Judgment" value={judgmentText} onChangeText={setJudgmentText} placeholder="Paste the full judgment text here..." multiline />

        <AIButton title={loading ? "Analyzing..." : "Generate Summary"} onPress={handleGenerate} loading={loading} />

        {loading && <LoadingCard />}
        {error && <ErrorCard message={error} onRetry={handleGenerate} onDismiss={clearError} />}

        {result && (
          <>
            <AIResultCard title="Judgment Summary">
              <ResultSection label="Facts" text={result.facts} />
              <ResultSection label="Issues" text={result.issues} />
              <ResultSection label="Court Findings" text={result.courtFindings} />
              <ResultSection label="Decision" text={result.decision} />
              <ResultSection label="Key Observations" text={result.keyObservations} />
              <ResultSection label="Ratio Decidendi" text={result.ratioDecidendi} />
            </AIResultCard>
            <ActionButtons text={resultText} />
          </>
        )}

        {!loading && !error && !result && (
          <EmptyState icon="scale-outline" title="Paste a judgment above" subtitle="Get a structured summary with facts, issues, findings, and ratio decidendi" />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AI_BG },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
});

export default memo(SummarizeJudgmentScreen);