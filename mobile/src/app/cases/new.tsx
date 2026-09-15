import React from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { router } from "expo-router";
import CaseForm from "@/components/cases/CaseForm";
import { createCase } from "@/services/caseApi";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

export default function NewCaseScreen() {
  const [submitting, setSubmitting] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  return (
    <KeyboardAwareView contentContainerStyle={styles.container}>
      <Text style={styles.title}>New Case</Text>

      {submitting && <ActivityIndicator size="small" color={colors.accent.gold} />}

      <CaseForm
        mode="create"
        onSubmit={async (payload) => {
          if (submitting) return;
          setSubmitting(true);
          setCreateError(null);
          try {
            const res = await createCase(payload);
            router.replace(`/cases/${res?._id ?? res?.case?._id ?? ""}` as any);
          } catch (e: any) {
            const { normalizeApiError: toMessage } = await import("@/services/api");
            setCreateError(toMessage(e));
          } finally {
            setSubmitting(false);
          }
        }}
        submitLabel="Create Case"
      />

      {createError ? (
        <View style={styles.errorBox} accessibilityRole="alert">
          <Text style={styles.errorText}>{createError}</Text>
        </View>
      ) : null}

      <Pressable
        style={styles.backBtn}
        onPress={() => router.push("/cases" as any)}
        accessibilityRole="button"
        accessibilityLabel="Back to case list"
        accessibilityHint="Returns to the case list without creating a case"
        hitSlop={8}
      >
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
    fontWeight: "800",
  },
  backBtn: {
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: 14,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "700",
  },
  backText: {
    color: colors.accent.gold,
    fontWeight: "800",
  },
});

