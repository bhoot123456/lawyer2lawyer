import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getCaseById, addNote } from "@/services/caseApi";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

export default function NotesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [caseDoc, setCaseDoc] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getCaseById(id);
      setCaseDoc(res);
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

  return (
    <KeyboardAwareView contentContainerStyle={styles.container}>
      {loading && <ActivityIndicator size="small" color="#B58D3D" />}

      <Text style={styles.title}>Notes</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Note title" placeholderTextColor="rgba(181, 141, 61, 0.35)" />

        <Text style={styles.label}>Description</Text>
        <TextInput value={description} onChangeText={setDescription} style={[styles.input, { height: 90 }]} placeholder="Note description" placeholderTextColor="rgba(181, 141, 61, 0.35)" multiline />

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput value={date} onChangeText={setDate} style={styles.input} placeholder="Optional" placeholderTextColor="rgba(181, 141, 61, 0.35)" />

        <Pressable
          style={styles.btn}
          onPress={async () => {
            if (!id) return;
            await addNote(id!, { title, description, date: date ? new Date(date).toISOString() : undefined });
            setTitle("");
            setDescription("");
            setDate("");
            await load();
          }}
        >
          <Text style={styles.btnText}>Add Note</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {(caseDoc?.notes || []).map((n: any, idx: number) => (
          <View key={`${n._id ?? idx}`} style={styles.item}>
            <Text style={styles.itemTitle}>{n.title}</Text>
            {n.description ? <Text style={styles.itemDesc}>{n.description}</Text> : null}
            <Text style={styles.itemDate}>
              {n.date ? String(n.date).slice(0, 10) : ""}
            </Text>
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
  title: { color: "#F8FAFC", fontSize: 20, fontWeight: "900" },
  form: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.20)", padding: 14, gap: 10 },
  label: { color: "rgba(181, 141, 61, 0.95)", fontWeight: "900", fontSize: 12 },
  input: { borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.25)", backgroundColor: "rgba(18, 18, 20, 0.35)", color: "#F8FAFC", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  btn: { backgroundColor: "rgba(181, 141, 61, 0.14)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.55)", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#D4AF37", fontWeight: "900", fontSize: 14 },
  list: { gap: 10 },
  item: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.18)", borderRadius: 16, padding: 14, gap: 6 },
  itemTitle: { color: "#F8FAFC", fontWeight: "900", fontSize: 13 },
  itemDesc: { color: "rgba(248, 250, 252, 0.80)", fontWeight: "700", fontSize: 12 },
  itemDate: { color: "rgba(181, 141, 61, 0.85)", fontWeight: "800", fontSize: 11 },
  backBtn: { marginTop: 8, backgroundColor: "rgba(181, 141, 61, 0.10)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.35)", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  backText: { color: "rgba(181, 141, 61, 0.95)", fontWeight: "900" },
});

