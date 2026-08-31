import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getCaseById, addTimelineEntry } from "@/services/caseApi";

export default function TimelineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [caseDoc, setCaseDoc] = useState<any>(null);
  const [type, setType] = useState("Other");
  const [description, setDescription] = useState("");

  useEffect(() => {
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
    load();
  }, [id]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading && <ActivityIndicator size="small" color="#B58D3D" />}

      <Text style={styles.title}>Timeline</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Type</Text>
        <TextInput
          value={type}
          onChangeText={setType}
          style={styles.input}
          placeholder="Other / ..."
          placeholderTextColor="rgba(181, 141, 61, 0.35)"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 90 }]}
          placeholder="Add timeline description"
          placeholderTextColor="rgba(181, 141, 61, 0.35)"
          multiline
        />

        <Pressable
          style={styles.btn}
          onPress={async () => {
            if (!id) return;
            await addTimelineEntry(id!, { type, description });
            const res = await getCaseById(id!);
            setCaseDoc(res);
            setDescription("");
          }}
        >
          <Text style={styles.btnText}>Add Entry</Text>
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
    fontWeight: "900",
  },
  form: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.20)",
    padding: 14,
    gap: 10,
  },
  label: {
    color: "rgba(181, 141, 61, 0.95)",
    fontWeight: "900",
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.25)",
    backgroundColor: "rgba(18, 18, 20, 0.35)",
    color: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: "rgba(181, 141, 61, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.55)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 14,
  },
  list: {
    gap: 10,
    marginTop: 6,
  },
  item: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.18)",
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  itemType: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 13,
  },
  itemDesc: {
    color: "rgba(248, 250, 252, 0.80)",
    fontWeight: "700",
    fontSize: 12,
  },
  itemDate: {
    color: "rgba(181, 141, 61, 0.85)",
    fontWeight: "800",
    fontSize: 11,
  },
  backBtn: {
    marginTop: 8,
    backgroundColor: "rgba(181, 141, 61, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.35)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  backText: {
    color: "rgba(181, 141, 61, 0.95)",
    fontWeight: "900",
  },
});

