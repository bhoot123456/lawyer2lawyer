import React, { useEffect, useState } from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet, ActivityIndicator, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getCaseById, updateExpenses } from "@/services/caseApi";
import { getAuthToken, normalizeApiError } from "@/services/api";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

export default function ExpensesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [caseDoc, setCaseDoc] = useState<any>(null);

  const [courtFee, setCourtFee] = useState<string>("0");
  const [stamp, setStamp] = useState<string>("0");
  const [printing, setPrinting] = useState<string>("0");
  const [travel, setTravel] = useState<string>("0");
  const [miscellaneous, setMiscellaneous] = useState<string>("0");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getCaseById(id);
      const c = res?.case ?? res;
      setCaseDoc(c);
      const e = c?.expenses || {};
      setCourtFee(String(e.courtFee ?? 0));
      setStamp(String(e.stamp ?? 0));
      setPrinting(String(e.printing ?? 0));
      setTravel(String(e.travel ?? 0));
      setMiscellaneous(String(e.miscellaneous ?? 0));
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

  const handleSaveExpenses = async () => {
    if (!id || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        setSubmitError("Please sign in as a lawyer/admin to update case expenses.");
        return;
      }
      await updateExpenses(id, {
        courtFee: Number(courtFee) || 0,
        stamp: Number(stamp) || 0,
        printing: Number(printing) || 0,
        travel: Number(travel) || 0,
        miscellaneous: Number(miscellaneous) || 0,
      });
      await load();
    } catch (e: any) {
      setSubmitError(normalizeApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  const total =
    Number(courtFee || 0) +
    Number(stamp || 0) +
    Number(printing || 0) +
    Number(travel || 0) +
    Number(miscellaneous || 0);

  return (
    <KeyboardAwareView contentContainerStyle={styles.container}>
      {loading && <ActivityIndicator size="small" color={colors.accent.gold} />}

      <Text style={styles.title}>Expenses</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Court fee</Text>
        <TextInput value={courtFee} onChangeText={setCourtFee} style={styles.input} keyboardType="numeric" />

        <Text style={styles.label}>Stamp</Text>
        <TextInput value={stamp} onChangeText={setStamp} style={styles.input} keyboardType="numeric" />

        <Text style={styles.label}>Printing</Text>
        <TextInput value={printing} onChangeText={setPrinting} style={styles.input} keyboardType="numeric" />

        <Text style={styles.label}>Travel</Text>
        <TextInput value={travel} onChangeText={setTravel} style={styles.input} keyboardType="numeric" />

        <Text style={styles.label}>Miscellaneous</Text>
        <TextInput value={miscellaneous} onChangeText={setMiscellaneous} style={styles.input} keyboardType="numeric" />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalVal}>₹ {total}</Text>
        </View>

        {submitError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.btn, submitting && { opacity: 0.7 }]}
          onPress={handleSaveExpenses}
          disabled={submitting}
        >
          <Text style={styles.btnText}>{submitting ? "Saving..." : "Save expenses"}</Text>
        </Pressable>
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
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  totalLabel: { color: "rgba(248, 250, 252, 0.78)", fontWeight: "800" },
  totalVal: { color: "#D4AF37", fontWeight: "800" },
  btn: { backgroundColor: colors.accent.goldLight, borderWidth: 1, borderColor: colors.border.gold, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#D4AF37", fontWeight: "800", fontSize: 14 },
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

