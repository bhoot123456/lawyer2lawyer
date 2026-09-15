import React, { useEffect, useState } from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet, ActivityIndicator, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getCaseById, addDocument } from "@/services/caseApi";
import { getAuthToken, normalizeApiError } from "@/services/api";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [caseDoc, setCaseDoc] = useState<any>(null);

  const [documentName, setDocumentName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [category, setCategory] = useState("Other");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getCaseById(id);
      setCaseDoc(res?.case ?? res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddDocument = async () => {
    if (!id || submitting) return;
    if (!documentName.trim()) {
      setSubmitError("Please enter a document name.");
      return;
    }
    if (!fileUrl.trim()) {
      setSubmitError("Please provide a file URL.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        setSubmitError("Please sign in as a lawyer/admin to attach documents to this case.");
        return;
      }
      await addDocument(id, { documentName: documentName.trim(), fileUrl: fileUrl.trim(), category });
      setDocumentName("");
      setFileUrl("");
      setCategory("Other");
      await load();
    } catch (e: any) {
      setSubmitError(normalizeApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAwareView contentContainerStyle={styles.container}>
      {loading && <ActivityIndicator size="small" color={colors.accent.gold} />}

      <Text style={styles.title}>Documents</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Document name</Text>
        <TextInput value={documentName} onChangeText={setDocumentName} style={styles.input} placeholder="e.g., Vakalatnama" placeholderTextColor={colors.border.gold} />

        <Text style={styles.label}>File URL</Text>
        <TextInput value={fileUrl} onChangeText={setFileUrl} style={styles.input} placeholder="https://..." placeholderTextColor={colors.border.gold} />

        <Text style={styles.label}>Category</Text>
        <TextInput value={category} onChangeText={setCategory} style={styles.input} placeholder="Other / Evidence / ..." placeholderTextColor={colors.border.gold} />

        {submitError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.btn, submitting && { opacity: 0.7 }]}
          onPress={handleAddDocument}
          disabled={submitting}
        >
          <Text style={styles.btnText}>{submitting ? "Uploading..." : "Upload metadata"}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {(caseDoc?.documents || []).map((d: any, idx: number) => (
          <View key={`${d._id ?? idx}`} style={styles.item}>
            <Text style={styles.itemTitle}>{d.documentName}</Text>
            <Text style={styles.itemDesc}>Category: {d.category || "Other"}</Text>
            <Text style={styles.itemUrl} numberOfLines={1}>URL: {d.fileUrl}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.backBtn} onPress={() => router.push(`/cases/${id}` as any)}>
        <Text style={styles.backText}>Back to case</Text>
      </Pressable>
    </KeyboardAwareView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 110 },
  title: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  form: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, borderWidth: 1, borderColor: colors.border.goldLight, padding: 14, gap: 10 },
  label: { color: colors.accent.gold, fontWeight: "800", fontSize: 12 },
  input: { borderWidth: 1, borderColor: colors.border.gold, backgroundColor: "rgba(18, 18, 20, 0.35)", color: "#F8FAFC", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  btn: { backgroundColor: colors.accent.goldLight, borderWidth: 1, borderColor: colors.border.gold, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#D4AF37", fontWeight: "800", fontSize: 14 },
  list: { gap: 10 },
  item: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.accent.goldLight, borderRadius: 16, padding: 14, gap: 6 },
  itemTitle: { color: "#F8FAFC", fontWeight: "800", fontSize: 13 },
  itemDesc: { color: "rgba(248, 250, 252, 0.80)", fontWeight: "700", fontSize: 12 },
  itemUrl: { color: "rgba(248, 250, 252, 0.70)", fontWeight: "700", fontSize: 11 },
  backBtn: { marginTop: 8, backgroundColor: colors.accent.goldLight, borderWidth: 1, borderColor: colors.border.gold, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  backText: { color: colors.accent.gold, fontWeight: "800" },
  errorBox: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 12,
    fontWeight: "700",
  },
});

