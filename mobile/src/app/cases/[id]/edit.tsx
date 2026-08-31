import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import CaseForm from "@/components/cases/CaseForm";
import { getCaseById, updateCase } from "@/services/caseApi";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

export default function EditCaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [caseDoc, setCaseDoc] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getCaseById(id);
        // Backend contract: GET /api/cases/:id -> { success, case }
        setCaseDoc(res?.case ?? res);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <KeyboardAwareView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Case</Text>
      {loading && <ActivityIndicator size="small" color="#B58D3D" />}

      {!loading && caseDoc && (
        <CaseForm
          mode="edit"
          initialValues={caseDoc}
          onSubmit={async (payload) => {
            await updateCase(id!, payload);
            router.replace(`/cases/${id}` as any);
          }}
          submitLabel="Save Changes"
        />
      )}

      <Pressable style={styles.backBtn} onPress={() => router.push(`/cases/${id}` as any)}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </KeyboardAwareView>
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
    fontSize: 22,
    fontWeight: "900",
  },
  backBtn: {
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

