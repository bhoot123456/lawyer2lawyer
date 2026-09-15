import React, { useEffect, useState } from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getCaseById, addTimelineEntry } from "@/services/caseApi";
import { getAuthToken, normalizeApiError } from "@/services/api";

export default function TimelineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [caseDoc, setCaseDoc] = useState<any>(null);
  const [type, setType] = useState("Other");
  const [description, setDescription] = useState("");

  useEffect(() => {
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
    load();
  }, [id]);

  const handleAddEntry = async () => {
    if (!id || submitting) return;
    if (!description.trim()) {
      setSubmitError("Please provide a description for the timeline entry.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        setSubmitError("Please sign in as a lawyer/admin to add timeline entries.");
        return;
      }
      await addTimelineEntry(id, { type, description: description.trim() });
      const res = await getCaseById(id);
      setCaseDoc(res?.case ?? res);
      setDescription("");
    } catch (e: any) {
      setSubmitError(normalizeApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading && <ActivityIndicator size="small" color={colors.accent.gold} />}

      <Text style={styles.title}>Timeline</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Type</Text>
        <TextInput
          value={type}
          onChangeText={setType}
          style={styles.input}
          placeholder="Other / ..."
          placeholderTextColor={colors.border.gold}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 90 }]}
          placeholder="Add timeline description"
          placeholderTextColor={colors.border.gold}
          multiline
        />

        {submitError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.btn, submitting && { opacity: 0.7 }]}
          onPress={handleAddEntry}
          disabled={submitting}
        >
          <Text style={styles.btnText}>{submitting ? "Adding..." : "Add Entry"}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {(caseDoc?.timeline || []).map((t: any, idx: number) => (
          <View key={`${t.createdAt ?? idx}`} style={styles.item}>
            <Text style={styles.itemType}>{t.type}</Text>
            <Text style={styles.itemDesc}>{t.description}</Text>
            <Text style={styles.itemDate}>
              {t.createdAt ? String(t.createdAt).slice(0, 10) : ""}
            </Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.backBtn} onPress={() => router.push(`/cases/${id}` as any)}>
        <Text style={styles.backText}>Back to case</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 110,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
  },
  form: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    padding: 14,
    gap: 10,
  },
  label: {
    color: colors.accent.gold,
    fontWeight: "800",
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.gold,
    backgroundColor: "rgba(18, 18, 20, 0.35)",
    color: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#D4AF37",
    fontWeight: "800",
    fontSize: 14,
  },
  list: {
    gap: 10,
    marginTop: 6,
  },
  item: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  itemType: {
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 12,
  },
  itemDesc: {
    color: "rgba(248, 250, 252, 0.80)",
    fontWeight: "700",
    fontSize: 12,
  },
  itemDate: {
    color: colors.accent.gold,
    fontWeight: "800",
    fontSize: 12,
  },
  backBtn: {
    marginTop: 8,
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  backText: {
    color: colors.accent.gold,
    fontWeight: "800",
  },
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

