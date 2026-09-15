import React, { useMemo, useState } from "react";
import { colors, radii, spacing, typography } from "@/theme/designSystem";
import { View, Text, TextInput, StyleSheet } from "react-native";
import useDebouncedValue from "@/hooks/useDebouncedValue";

type Props = {
  initialQuery?: Record<string, string>;
  onChange: (query: Record<string, string>) => void;
};

const TextInputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  autoCorrect,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
  autoCorrect?: boolean;
}) => {
  return (
    <View style={styles.field}>
      <Text style={styles.label} accessibilityRole="text">
        {label}
      </Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "sentences"}
        autoCorrect={autoCorrect ?? true}
        returnKeyType="search"
        blurOnSubmit={false}
        accessibilityLabel={label}
      />
    </View>
  );
};

export default function CaseSearchFilters({
  initialQuery,
  onChange,
}: Props) {
  const [caseNumber, setCaseNumber] = useState(
    String(initialQuery?.caseNumber ?? ""),
  );
  const [clientName, setClientName] = useState(
    String(initialQuery?.clientName ?? ""),
  );
  const [court, setCourt] = useState(String(initialQuery?.court ?? ""));
  const [practiceArea, setPracticeArea] = useState(
    String(initialQuery?.practiceArea ?? ""),
  );
  const [status, setStatus] = useState(String(initialQuery?.status ?? ""));
  const [priority, setPriority] = useState(
    String(initialQuery?.priority ?? ""),
  );
  const [advocate, setAdvocate] = useState(
    String(initialQuery?.advocate ?? ""),
  );
  const [nextHearing, setNextHearing] = useState(
    String(initialQuery?.nextHearing ?? ""),
  );

  const query = useMemo(() => {
    const q: Record<string, string> = {};
    if (caseNumber.trim()) q.caseNumber = caseNumber.trim();
    if (clientName.trim()) q.clientName = clientName.trim();
    if (court.trim()) q.court = court.trim();
    if (practiceArea.trim()) q.practiceArea = practiceArea.trim();
    if (status.trim()) q.status = status.trim();
    if (priority.trim()) q.priority = priority.trim();
    if (advocate.trim()) q.advocate = advocate.trim();
    if (nextHearing.trim()) q.nextHearing = nextHearing.trim();
    return q;
  }, [
    caseNumber,
    clientName,
    court,
    practiceArea,
    status,
    priority,
    advocate,
    nextHearing,
  ]);

  // Notify parent on debounced change — typing no longer fires one API
  // request per keystroke on slow court-day networks. Local inputs stay
  // immediate; only the parent fetch is delayed (~450ms).
  const debouncedQuery = useDebouncedValue(query, 450);
  const onChangeRef = React.useRef(onChange);
  // Keep the latest `onChange` in a ref so the debounced effect below never
  // needs it as a dependency. Synced in an effect (not during render) because
  // mutating a ref while rendering is unsafe under concurrent rendering.
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const lastSentRef = React.useRef("");
  React.useEffect(() => {
    const key = JSON.stringify(debouncedQuery);
    if (key !== lastSentRef.current) {
      lastSentRef.current = key;
      onChangeRef.current(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search filters</Text>

      <TextInputField
        label="Case No"
        value={caseNumber}
        onChangeText={setCaseNumber}
        placeholder="e.g., 1042"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInputField
        label="Client"
        value={clientName}
        onChangeText={setClientName}
        placeholder="Client name"
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TextInputField
        label="Court"
        value={court}
        onChangeText={setCourt}
        placeholder="High Court / District"
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TextInputField
        label="Practice Area"
        value={practiceArea}
        onChangeText={setPracticeArea}
        placeholder="e.g., Criminal"
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TextInputField
        label="Status"
        value={status}
        onChangeText={setStatus}
        placeholder="Pending / Filed / ..."
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TextInputField
        label="Priority"
        value={priority}
        onChangeText={setPriority}
        placeholder="Low / Medium / High / Urgent"
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TextInputField
        label="Advocate"
        value={advocate}
        onChangeText={setAdvocate}
        placeholder="Advocate name"
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TextInputField
        label="Next Hearing"
        value={nextHearing}
        onChangeText={setNextHearing}
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numbers-and-punctuation"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontWeight: typography.h4.fontWeight,
    fontSize: typography.h4.fontSize,
    marginBottom: spacing.sm,
  },
  field: {
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.accent.gold,
    fontWeight: typography.label.fontWeight,
    fontSize: typography.label.fontSize,
    letterSpacing: typography.label.letterSpacing,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.elevated,
    color: colors.text.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    fontSize: typography.body.fontSize,
  },
});