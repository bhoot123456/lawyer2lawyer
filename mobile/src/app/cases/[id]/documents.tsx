import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getCaseById, addDocument } from "@/services/caseApi";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [caseDoc, setCaseDoc] = useState<any>(null);

  const [documentName, setDocumentName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [category, setCategory] = useState("Other");

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

      <Text style={styles.title}>Documents</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Document name</Text>
        <TextInput value={documentName} onChangeText={setDocumentName} style={styles.input} placeholder="e.g., Vakalatnama" placeholderTextColor="rgba(181, 141, 61, 0.35)" />

        <Text style={styles.label}>File URL</Text>
        <TextInput value={fileUrl} onChangeText={setFileUrl} style={styles.input} placeholder="https://..." placeholderTextColor="rgba(181, 141, 61, 0.35)" />

        <Text style={styles.label}>Category</Text>
        <TextInput value={category} onChangeText={setCategory} style={styles.input} placeholder="Other / Evidence / ..." placeholderTextColor="rgba(181, 141, 61, 0.35)" />

        <Pressable
          style={styles.btn}
          onPress={async () => {
            if (!id) return;
            await addDocument(id!, { documentName, fileUrl, category });
            setDocumentName("");
            setFileUrl("");
            setCategory("Other");
            await load();
          }}
        >
          <Text style={styles.btnText}>Upload metadata</Text>
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
  itemUrl: { color: "rgba(248, 250, 252, 0.70)", fontWeight: "700", fontSize: 11 },
  backBtn: { marginTop: 8, backgroundColor: "rgba(181, 141, 61, 0.10)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.35)", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  backText: { color: "rgba(181, 141, 61, 0.95)", fontWeight: "900" },
});

