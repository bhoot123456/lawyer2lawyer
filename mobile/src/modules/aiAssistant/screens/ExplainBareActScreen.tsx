import React, { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useAIAssistant } from "../hooks/useAIAssistant";
import { AIHeader, AIInput, AIButton, AIResultCard, ResultSection, ResultBulletList, LoadingCard, ErrorCard, EmptyState, ActionButtons } from "../components";
import { AI_BG } from "../constants";
import type { ExplainBareActResponse } from "../types";

const ExplainBareActScreen: React.FC = () => {
  const [actName, setActName] = useState("");
  const [sectionNumber, setSectionNumber] = useState("");
  const { loading, error, data, explainBareAct, clearError } = useAIAssistant("explain-bare-act");
  const result = data as ExplainBareActResponse | null;

  const handleGenerate = useCallback(() => {
    if (!actName.trim() || !sectionNumber.trim()) {
      Alert.alert("Missing Fields", "Please enter both Act Name and Section Number");
      return;
    }
    explainBareAct({ actName, sectionNumber });
  }, [actName, sectionNumber, explainBareAct]);

  const resultText = result
    ? `Explanation:\n${result.simpleExplanation}\n\nKeywords:\n${result.importantKeywords.join(", ")}\n\nExample:\n${result.example}\n\nFuture References:\n${result.futureCaseReferences}`
    : "";

  return (
    <View style={styles.container}>
      <AIHeader title="Explain Bare Act" subtitle="Understand legal provisions simply" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <AIInput label="Act Name" value={actName} onChangeText={setActName} placeholder="e.g., Indian Penal Code, 1860" />
        <AIInput label="Section Number" value={sectionNumber} onChangeText={setSectionNumber} placeholder="e.g., 302, 420, 138" />

        <AIButton title={loading ? "Explaining..." : "Explain"} onPress={handleGenerate} loading={loading} />

        {loading && <LoadingCard />}
        {error && <ErrorCard message={error} onRetry={handleGenerate} onDismiss={clearError} />}

        {result && (
          <>
            <AIResultCard title={`Section ${sectionNumber} - ${actName}`}>
              <ResultSection label="Simple Explanation" text={result.simpleExplanation} />
              <ResultBulletList label="Important Keywords" items={result.importantKeywords} />
              <ResultSection label="Example" text={result.example} />
              <ResultSection label="Future Case References" text={result.futureCaseReferences} />
            </AIResultCard>
            <ActionButtons text={resultText} />
          </>
        )}

        {!loading && !error && !result && (
          <EmptyState icon="book-outline" title="Enter act details above" subtitle="Get a plain-language explanation of any legal section" />
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

export default memo(ExplainBareActScreen);