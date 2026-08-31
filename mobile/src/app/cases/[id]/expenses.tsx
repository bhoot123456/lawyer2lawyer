import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getCaseById, updateExpenses } from "@/services/caseApi";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

export default function ExpensesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
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
      setCaseDoc(res);
      const e = res?.expenses || {};
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

  const total =
    Number(courtFee || 0) +
    Number(stamp || 0) +
    Number(printing || 0) +
    Number(travel || 0) +
    Number(miscellaneous || 0);

  return (
    <KeyboardAwareView contentContainerStyle={styles.container}>
      {loading && <ActivityIndicator size="small" color="#B58D3D" />}

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

        <Pressable
          style={styles.btn}
          onPress={async () => {
            if (!id) return;
            await updateExpenses(id!, {
              courtFee: Number(courtFee),
              stamp: Number(stamp),
              printing: Number(printing),
              travel: Number(travel),
              miscellaneous: Number(miscellaneous),
            });
            await load();
          }}
        >
          <Text style={styles.btnText}>Save expenses</Text>
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
  title: { color: "#F8FAFC", fontSize: 20, fontWeight: "900" },
  form: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.20)", padding: 14, gap: 10 },
  label: { color: "rgba(181, 141, 61, 0.95)", fontWeight: "900", fontSize: 12 },
  input: { borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.25)", backgroundColor: "rgba(18, 18, 20, 0.35)", color: "#F8FAFC", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  totalLabel: { color: "rgba(248, 250, 252, 0.78)", fontWeight: "900" },
  totalVal: { color: "#D4AF37", fontWeight: "900" },
  btn: { backgroundColor: "rgba(181, 141, 61, 0.14)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.55)", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#D4AF37", fontWeight: "900", fontSize: 14 },
  backBtn: { marginTop: 8, backgroundColor: "rgba(181, 141, 61, 0.10)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.35)", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  backText: { color: "rgba(181, 141, 61, 0.95)", fontWeight: "900" },
});

