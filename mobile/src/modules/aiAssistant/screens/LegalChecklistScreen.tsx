import React, { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useAIAssistant } from "../hooks/useAIAssistant";
import { AIHeader, AIButton, AIResultCard, ResultSection, ResultBulletList, LoadingCard, ErrorCard, EmptyState, ActionButtons } from "../components";
import { CASE_TYPE_OPTIONS, AI_BG } from "../constants";
import type { ChecklistCaseType, GenerateChecklistResponse } from "../types";

const LegalChecklistScreen: React.FC = () => {
  const [caseType, setCaseType] = useState<ChecklistCaseType | null>(null);
  const { loading, error, data, generateChecklist, clearError } = useAIAssistant("legal-checklist");
  const result = data as GenerateChecklistResponse | null;

  const handleGenerate = useCallback(() => {
    if (!caseType) return;
    generateChecklist({ caseType });
  }, [caseType, generateChecklist]);

  const resultText = result
    ? `Case Type: ${result.caseType}\n\nRequired Documents:\n${result.requiredDocuments.join("\n")}\n\nImportant Dates:\n${result.importantDates.join("\n")}\n\nApplicable Laws:\n${result.applicableLaws.join("\n")}\n\nCourt Procedure:\n${result.courtProcedure.join("\n")}\n\nEstimated Timeline:\n${result.estimatedTimeline}`
    : "";

  return (
    <View style={styles.container}>
      <AIHeader title="Legal Checklist" subtitle="Get case-type-specific checklists" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>CASE TYPE</Text>
        <View style={styles.pickerGrid}>
          {CASE_TYPE_OPTIONS.map((opt) => (
            <AIButton
              key={opt.value}
              title={opt.label}
              onPress={() => setCaseType(opt.value)}
              variant={caseType === opt.value ? "primary" : "secondary"}
              style={styles.pickerButton}
            />
          ))}
        </View>

        <AIButton
          title={loading ? "Generating..." : "Generate Checklist"}
          onPress={handleGenerate}
          loading={loading}
          disabled={!caseType}
        />

        {loading && <LoadingCard />}
        {error && <ErrorCard message={error} onRetry={handleGenerate} onDismiss={clearError} />}

        {result && (
          <>
            <AIResultCard title={`${result.caseType} Checklist`}>
              <ResultBulletList label="Required Documents" items={result.requiredDocuments} />
              <ResultBulletList label="Important Dates" items={result.importantDates} />
              <ResultBulletList label="Applicable Laws" items={result.applicableLaws} />
              <ResultBulletList label="Court Procedure" items={result.courtProcedure} />
              <ResultSection label="Estimated Timeline" text={result.estimatedTimeline} />
            </AIResultCard>
            <ActionButtons text={resultText} />
          </>
        )}

        {!loading && !error && !result && (
          <EmptyState icon="checkmark-circle-outline" title="Select a case type above" subtitle="Get a comprehensive checklist with documents, laws, and procedure" />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AI_BG },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  label: { color: "#B0B4BA", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 },
  pickerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  pickerButton: { width: "31%" },
});

export default memo(LegalChecklistScreen);