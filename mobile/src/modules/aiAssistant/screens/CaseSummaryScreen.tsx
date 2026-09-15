import React, { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAIAssistant } from "../hooks/useAIAssistant";
import { AIHeader, AIInput, AIButton, AIResultCard, ResultSection, ResultBulletList, LoadingCard, ErrorCard, EmptyState, ActionButtons } from "../components";
import { AI_BG } from "../constants";
import type { CaseSummaryResponse } from "../types";

const CaseSummaryScreen: React.FC = () => {
  const [caseFacts, setCaseFacts] = useState("");
  const [parties, setParties] = useState("");
  const [issues, setIssues] = useState("");
  const [court, setCourt] = useState("");
  const { loading, error, data, generateCaseSummary, clearError } = useAIAssistant("case-summary");
  const result = data as CaseSummaryResponse | null;

  const handleGenerate = useCallback(() => {
    if (!caseFacts.trim() || !parties.trim()) {
      Alert.alert("Missing Fields", "Please fill in at least Case Facts and Parties");
      return;
    }
    generateCaseSummary({ caseFacts, parties, issues, court });
  }, [caseFacts, parties, issues, court, generateCaseSummary]);

  const resultText = result
    ? `Background:\n${result.background}\n\nLegal Issues:\n${result.legalIssues}\n\nArguments:\n${result.arguments}\n\nEvidence:\n${result.evidence}\n\nOutcome:\n${result.outcome}\n\nImportant Points:\n${result.importantPoints.join("\n")}`
    : "";

  return (
    <View style={styles.container}>
      <AIHeader title="Case Summary" subtitle="Generate comprehensive case briefs" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <AIInput label="Case Facts" value={caseFacts} onChangeText={setCaseFacts} placeholder="Describe the facts of the case" multiline />
        <AIInput label="Parties" value={parties} onChangeText={setParties} placeholder="e.g., Appellant vs Respondent" />
        <AIInput label="Legal Issues" value={issues} onChangeText={setIssues} placeholder="Key legal issues involved" multiline />
        <AIInput label="Court" value={court} onChangeText={setCourt} placeholder="e.g., Supreme Court of India" />

        <AIButton title={loading ? "Generating..." : "Generate Summary"} onPress={handleGenerate} loading={loading} />

        {loading && <LoadingCard />}
        {error && <ErrorCard message={error} onRetry={handleGenerate} onDismiss={clearError} />}

        {result && (
          <>
            <AIResultCard title="Case Summary">
              <ResultSection label="Background" text={result.background} />
              <ResultSection label="Legal Issues" text={result.legalIssues} />
              <ResultSection label="Arguments" text={result.arguments} />
              <ResultSection label="Evidence" text={result.evidence} />
              <ResultSection label="Outcome" text={result.outcome} />
              <ResultBulletList label="Important Points" items={result.importantPoints} />
            </AIResultCard>
            <ActionButtons text={resultText} />
          </>
        )}

        {!loading && !error && !result && (
          <EmptyState icon="briefcase-outline" title="Enter case details above" subtitle="Generate a structured case summary with background, issues, and outcome" />
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

export default memo(CaseSummaryScreen);