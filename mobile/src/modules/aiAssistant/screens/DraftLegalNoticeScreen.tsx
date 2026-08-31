import React, { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useAIAssistant } from "../hooks/useAIAssistant";
import { AIHeader, AIInput, AIButton, AIResultCard, LoadingCard, ErrorCard, EmptyState, ActionButtons } from "../components";
import { NOTICE_TYPE_OPTIONS, LANGUAGE_OPTIONS, AI_BG } from "../constants";
import type { NoticeType, Language, DraftLegalNoticeResponse } from "../types";

const DraftLegalNoticeScreen: React.FC = () => {
  const [noticeType, setNoticeType] = useState<NoticeType>("legal-notice");
  const [clientName, setClientName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [facts, setFacts] = useState("");
  const [reliefSought, setReliefSought] = useState("");
  const [language, setLanguage] = useState<Language>("english");
  const [showPicker, setShowPicker] = useState<string | null>(null);

  const { loading, error, data, generateLegalNotice, clearError } = useAIAssistant("draft-legal-notice");
  const result = data as DraftLegalNoticeResponse | null;

  const handleGenerate = useCallback(() => {
    if (!clientName.trim() || !recipientName.trim() || !facts.trim() || !reliefSought.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields");
      return;
    }
    generateLegalNotice({ noticeType, clientName, recipientName, facts, reliefSought, language });
  }, [noticeType, clientName, recipientName, facts, reliefSought, language, generateLegalNotice]);

  const selectOption = useCallback((picker: string, value: string) => {
    if (picker === "noticeType") setNoticeType(value as NoticeType);
    if (picker === "language") setLanguage(value as Language);
    setShowPicker(null);
  }, []);

  return (
    <View style={styles.container}>
      <AIHeader title="Draft Legal Notice" subtitle="Generate professional legal notices" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Notice Type Selector */}
        <Text style={styles.pickerLabel}>NOTICE TYPE</Text>
        <View style={styles.pickerRow}>
          {NOTICE_TYPE_OPTIONS.slice(0, 3).map((opt) => (
            <AIButton
              key={opt.value}
              title={opt.label}
              onPress={() => selectOption("noticeType", opt.value)}
              variant={noticeType === opt.value ? "primary" : "secondary"}
              style={styles.pickerButton}
            />
          ))}
        </View>
        <View style={styles.pickerRow}>
          {NOTICE_TYPE_OPTIONS.slice(3).map((opt) => (
            <AIButton
              key={opt.value}
              title={opt.label}
              onPress={() => selectOption("noticeType", opt.value)}
              variant={noticeType === opt.value ? "primary" : "secondary"}
              style={styles.pickerButton}
            />
          ))}
        </View>

        {/* Language Selector */}
        <Text style={styles.pickerLabel}>LANGUAGE</Text>
        <View style={styles.pickerRow}>
          {LANGUAGE_OPTIONS.map((opt) => (
            <AIButton
              key={opt.value}
              title={opt.label}
              onPress={() => selectOption("language", opt.value)}
              variant={language === opt.value ? "primary" : "secondary"}
              style={styles.pickerButtonSmall}
            />
          ))}
        </View>

        <AIInput label="Client Name" value={clientName} onChangeText={setClientName} placeholder="Enter client name" />
        <AIInput label="Recipient Name" value={recipientName} onChangeText={setRecipientName} placeholder="Enter recipient name" />
        <AIInput label="Facts" value={facts} onChangeText={setFacts} placeholder="Describe the facts of the case" multiline />
        <AIInput label="Relief Sought" value={reliefSought} onChangeText={setReliefSought} placeholder="What relief is being sought?" multiline />

        <AIButton title={loading ? "Generating..." : "Generate Notice"} onPress={handleGenerate} loading={loading} />

        {loading && <LoadingCard />}
        {error && <ErrorCard message={error} onRetry={handleGenerate} onDismiss={clearError} />}

        {result && (
          <>
            <AIResultCard title={result.noticeTitle}>
              <Text style={styles.noticeBody}>{result.noticeBody}</Text>
            </AIResultCard>
            <ActionButtons text={result.noticeBody} />
          </>
        )}

        {!loading && !error && !result && (
          <EmptyState icon="document-text-outline" title="Fill in the details above" subtitle="Then tap Generate Notice to create a professional legal notice" />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AI_BG },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  pickerLabel: { color: "#B0B4BA", fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 6 },
  pickerRow: { flexDirection: "row", gap: 16, marginBottom: 10 },
  pickerButton: { flex: 1 ,},
  pickerButtonSmall: { flex: 0, paddingHorizontal: 16 , paddingRight: 55 },
  noticeBody: { color: "#F8FAFC", fontSize: 13, lineHeight: 19, fontWeight: "400" },
});

export default memo(DraftLegalNoticeScreen);
