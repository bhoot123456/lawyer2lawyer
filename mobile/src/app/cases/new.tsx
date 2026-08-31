import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { router } from "expo-router";
import CaseForm from "@/components/cases/CaseForm";
import { createCase } from "@/services/caseApi";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

export default function NewCaseScreen() {
  const [submitting, setSubmitting] = React.useState(false);
  return (
    <KeyboardAwareView contentContainerStyle={styles.container}>
      <Text style={styles.title}>New Case</Text>

      {submitting && <ActivityIndicator size="small" color="#B58D3D" />}

      <CaseForm
        mode="create"
        onSubmit={async (payload) => {
          setSubmitting(true);
          try {
            const res = await createCase(payload);
            router.replace(`/cases/${res?._id ?? res?.case?._id ?? ""}` as any);
          } finally {
            setSubmitting(false);
          }
        }}
        submitLabel="Create Case"
      />

      <Pressable style={styles.backBtn} onPress={() => router.push("/cases" as any)}>
        <Text style={styles.backText}>Back to list</Text>
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

