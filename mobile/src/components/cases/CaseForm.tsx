import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";
import { getAuthToken } from "@/services/api";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  initialValues?: any;
  onSubmit: (payload: any) => Promise<void> | void;
  submitLabel?: string;
};

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
}) => {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="rgba(181, 141, 61, 0.35)"
        value={value}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
};

export default function CaseForm({
  mode,
  initialValues,
  onSubmit,
  submitLabel,
}: Props) {
  const [caseNumber, setCaseNumber] = useState(String(initialValues?.caseNumber ?? ""));
  const [caseTitle, setCaseTitle] = useState(String(initialValues?.caseTitle ?? ""));
  const [assignedTo, setAssignedTo] = useState(String(initialValues?.assignedTo ?? ""));

  const [client, setClient] = useState(String(initialValues?.client ?? ""));
  const [advocate, setAdvocate] = useState(String(initialValues?.advocate ?? ""));
  const [court, setCourt] = useState(String(initialValues?.court ?? ""));
  const [judge, setJudge] = useState(String(initialValues?.judge ?? ""));
  const [oppositeParty, setOppositeParty] = useState(
    String(initialValues?.oppositeParty ?? ""),
  );
  const [oppositeAdvocate, setOppositeAdvocate] = useState(
    String(initialValues?.oppositeAdvocate ?? ""),
  );
  const [practiceArea, setPracticeArea] = useState(
    String(initialValues?.practiceArea ?? ""),
  );
  const [caseType, setCaseType] = useState(String(initialValues?.caseType ?? ""));

  const [filingDate, setFilingDate] = useState(
    initialValues?.filingDate ? String(initialValues.filingDate).slice(0, 10) : "",
  );
  const [registrationDate, setRegistrationDate] = useState(
    initialValues?.registrationDate
      ? String(initialValues.registrationDate).slice(0, 10)
      : "",
  );
  const [nextHearingDate, setNextHearingDate] = useState(
    initialValues?.nextHearingDate
      ? String(initialValues.nextHearingDate).slice(0, 10)
      : "",
  );

  const [currentStage, setCurrentStage] = useState(
    String(initialValues?.currentStage ?? "Pending"),
  );
  const [status, setStatus] = useState(String(initialValues?.status ?? "Pending"));
  const [priority, setPriority] = useState(String(initialValues?.priority ?? "Medium"));

  const [description, setDescription] = useState(
    String(initialValues?.description ?? ""),
  );
  const [importantNotes, setImportantNotes] = useState(
    String(initialValues?.importantNotes ?? ""),
  );

  const [caseTagsCsv, setCaseTagsCsv] = useState(
    Array.isArray(initialValues?.caseTags)
      ? initialValues.caseTags.join(",")
      : String(initialValues?.caseTags ?? ""),
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();
      if (token) {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  const payloadPreview = useMemo(() => {
    const tags: string[] = caseTagsCsv
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    return {
      caseTitle,
      caseNumber,
      assignedTo,

      client,
      advocate,
      court,
      judge,

      oppositeParty,
      oppositeAdvocate,

      practiceArea,
      caseType,

      filingDate: filingDate ? new Date(filingDate).toISOString() : undefined,
      registrationDate: registrationDate
        ? new Date(registrationDate).toISOString()
        : undefined,
      nextHearingDate: nextHearingDate
        ? new Date(nextHearingDate).toISOString()
        : undefined,

      currentStage,
      status,
      priority,

      description,
      importantNotes,
      caseTags: tags,

      // Keep rollups empty by default; backend expects objects/arrays to exist.
      expenses: initialValues?.expenses ?? {},
      documents: initialValues?.documents ?? [],
      notes: initialValues?.notes ?? [],
    };
  }, [
    assignedTo,
    caseNumber,
    caseTitle,
    caseTagsCsv,
    client,
    advocate,
    court,
    judge,
    oppositeParty,
    oppositeAdvocate,
    practiceArea,
    caseType,
    filingDate,
    registrationDate,
    nextHearingDate,
    currentStage,
    status,
    priority,
    description,
    importantNotes,
    initialValues,
  ]);

  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const tags = caseTagsCsv
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

      const base: any = {
        caseTitle,
        assignedTo,
        client,
        advocate,
        court,
        judge,
        oppositeParty,
        oppositeAdvocate,
        practiceArea,
        caseType,
        currentStage,
        status,
        priority,
        description,
        importantNotes,
        caseTags: tags,
        expenses: payloadPreview.expenses,
        documents: payloadPreview.documents,
        notes: payloadPreview.notes,
      };

      if (mode === "create") base.caseNumber = caseNumber;

      if (filingDate) base.filingDate = new Date(filingDate).toISOString();
      if (registrationDate)
        base.registrationDate = new Date(registrationDate).toISOString();
      if (nextHearingDate)
        base.nextHearingDate = new Date(nextHearingDate).toISOString();

      await onSubmit(base);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAwareView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {mode === "create" ? "Create Case" : "Edit Case"}
      </Text>

      {mode === "create" && (
        <Field
          label="Case Number"
          value={caseNumber}
          onChangeText={setCaseNumber}
          placeholder="Unique case number"
        />
      )}

      <Field
        label="Case Title"
        value={caseTitle}
        onChangeText={setCaseTitle}
        placeholder="e.g., Writ Petition"
      />

      {isAuthenticated && (
        <Field
          label="Assigned To (UserId)"
          value={assignedTo}
          onChangeText={setAssignedTo}
          placeholder="Mongo User ObjectId"
        />
      )}

      <Field label="Client" value={client} onChangeText={setClient} />
      <Field label="Advocate" value={advocate} onChangeText={setAdvocate} />
      <Field label="Court" value={court} onChangeText={setCourt} />
      <Field label="Judge" value={judge} onChangeText={setJudge} />
      <Field
        label="Opposite Party"
        value={oppositeParty}
        onChangeText={setOppositeParty}
      />
      <Field
        label="Opposite Advocate"
        value={oppositeAdvocate}
        onChangeText={setOppositeAdvocate}
      />
      <Field
        label="Practice Area"
        value={practiceArea}
        onChangeText={setPracticeArea}
      />
      <Field label="Case Type" value={caseType} onChangeText={setCaseType} />

      <Field
        label="Filing Date"
        value={filingDate}
        onChangeText={setFilingDate}
        placeholder="YYYY-MM-DD"
      />
      <Field
        label="Registration Date"
        value={registrationDate}
        onChangeText={setRegistrationDate}
        placeholder="YYYY-MM-DD"
      />
      <Field
        label="Next Hearing Date"
        value={nextHearingDate}
        onChangeText={setNextHearingDate}
        placeholder="YYYY-MM-DD"
      />

      <Field
        label="Current Stage"
        value={currentStage}
        onChangeText={setCurrentStage}
        placeholder="Pending / Filed / ..."
      />
      <Field
        label="Status"
        value={status}
        onChangeText={setStatus}
        placeholder="Pending / Filed / ..."
      />
      <Field
        label="Priority"
        value={priority}
        onChangeText={setPriority}
        placeholder="Low / Medium / High / Urgent"
      />

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Short description"
          placeholderTextColor="rgba(181, 141, 61, 0.35)"
          style={[styles.input, { height: 90 }]}
          multiline
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Important Notes</Text>
        <TextInput
          value={importantNotes}
          onChangeText={setImportantNotes}
          placeholder="Important notes"
          placeholderTextColor="rgba(181, 141, 61, 0.35)"
          style={[styles.input, { height: 90 }]}
          multiline
        />
      </View>

      <Field
        label="Case Tags"
        value={caseTagsCsv}
        onChangeText={setCaseTagsCsv}
        placeholder="tag1,tag2"
      />

      <View style={styles.submitRow}>
        <Pressable
          style={[styles.btn, submitting ? { opacity: 0.7 } : null]}
          onPress={submit}
          disabled={submitting}
        >
          <Text style={styles.btnText}>
            {submitting ? "Saving..." : submitLabel ?? (mode === "create" ? "Create" : "Save")}
          </Text>
        </Pressable>
      </View>

      {/* Lightweight preview hint (helps debugging if backend rejects payload) */}
      <View style={styles.hintBox}>
        <Text style={styles.hintTitle}>Payload keys</Text>
        <Text style={styles.hintText} numberOfLines={3}>
          {Object.keys(payloadPreview)
            .filter((k) => {
              const v = (payloadPreview as any)[k];
              return v !== undefined;
            })
            .join(", ")}
        </Text>
      </View>
    </KeyboardAwareView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  field: {
    gap: 6,
  },
  label: {
    color: "rgba(181, 141, 61, 0.9)",
    fontWeight: "800",
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
  submitRow: {
    marginTop: 6,
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
  hintBox: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.18)",
    borderRadius: 12,
    backgroundColor: "rgba(181, 141, 61, 0.06)",
  },
  hintTitle: {
    color: "rgba(181, 141, 61, 0.95)",
    fontWeight: "900",
    marginBottom: 4,
  },
  hintText: {
    color: "rgba(248, 250, 252, 0.85)",
    fontWeight: "700",
    fontSize: 12,
  },
});