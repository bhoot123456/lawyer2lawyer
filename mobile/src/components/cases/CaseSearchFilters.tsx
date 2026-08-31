import React, { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

type Props = {
  initialQuery?: Record<string, string>;
  onChange: (query: Record<string, string>) => void;
};

const TextInputField = ({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (v: string) => void;
}) => {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="rgba(181, 141, 61, 0.35)"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
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

  // Notify parent on any change
  React.useEffect(() => {
    onChange(query);
  }, [query, onChange]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search filters</Text>

      <TextInputField
        label="Case No"
        value={caseNumber}
        onChangeText={setCaseNumber}
        placeholder="e.g., 1042"
      />

      <TextInputField
        label="Client"
        value={clientName}
        onChangeText={setClientName}
        placeholder="Client name"
      />

      <TextInputField
        label="Court"
        value={court}
        onChangeText={setCourt}
        placeholder="High Court / District"
      />

      <TextInputField
        label="Practice Area"
        value={practiceArea}
        onChangeText={setPracticeArea}
        placeholder="e.g., Criminal"
      />

      <TextInputField
        label="Status"
        value={status}
        onChangeText={setStatus}
        placeholder="Pending / Filed / ..."
      />

      <TextInputField
        label="Priority"
        value={priority}
        onChangeText={setPriority}
        placeholder="Low / Medium / High / Urgent"
      />

      <TextInputField
        label="Advocate"
        value={advocate}
        onChangeText={setAdvocate}
        placeholder="Advocate name"
      />

      <TextInputField
        label="Next Hearing"
        value={nextHearing}
        onChangeText={setNextHearing}
        placeholder="YYYY-MM-DD"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.25)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  title: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 10,
  },
  field: {
    marginBottom: 10,
  },
  label: {
    color: "rgba(181, 141, 61, 0.9)",
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 4,
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
});