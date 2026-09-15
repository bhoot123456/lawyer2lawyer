import React, { useMemo, useState, useEffect } from "react";
import { colors, radii, spacing, typography } from "@/theme/designSystem";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { getAuthToken } from "@/services/api";
import { parseValidDate, safeToISOString } from "@/utils/dateUtils";

type Mode = "create" | "edit";

// Must exactly mirror the backend enums in backend/models/Case.js and
// backend/validation/caseValidation.js — the payload is only ever built
// from these values, so it can never drift out of the allowed sets.
const STATUS_OPTIONS = [
  "Pending",
  "Filed",
  "Notice Issued",
  "Reply Filed",
  "Evidence",
  "Arguments",
  "Reserved",
  "Disposed",
  "Closed",
] as const;

const CURRENT_STAGE_OPTIONS = ["Draft", ...STATUS_OPTIONS] as const;

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"] as const;

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
  autoCapitalize,
  autoCorrect,
  returnKeyType,
  onSubmitEditing,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  autoCorrect?: boolean;
  returnKeyType?: any;
  onSubmitEditing?: () => void;
  error?: string;
}) => {
  return (
    <View style={styles.field}>
      <Text style={styles.label} accessibilityRole="text">{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        value={value}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "sentences"}
        autoCorrect={autoCorrect ?? true}
        returnKeyType={returnKeyType ?? "next"}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={false}
        onChangeText={onChangeText}
        style={[styles.input, error ? styles.inputError : null]}
        accessibilityLabel={label}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Enum-backed selector rendered as selectable chips. The backend validates
// status/currentStage/priority against strict enums — free-text input there
// used to produce 400 "Invalid status" responses. Chips keep the payload
// always within the allowed values, on both web and native, with no extra
// dependency.
const SelectField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) => {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(opt)}
              style={[styles.chip, selected ? styles.chipSelected : null]}
            >
              <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
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

  // Convert any incoming date-ish value (ISO string, timestamp, Date) into a
  // YYYY-MM-DD input value. Garbage from the API/drafts becomes "" rather
  // than an unparseable input; the form still renders and lets the user fix it.
  const toDateInput = (value: unknown): string => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value.trim())) {
      return value.trim().slice(0, 10);
    }
    const iso = safeToISOString(value);
    return iso ? iso.slice(0, 10) : "";
  };

  const [filingDate, setFilingDate] = useState(toDateInput(initialValues?.filingDate));
  const [registrationDate, setRegistrationDate] = useState(
    toDateInput(initialValues?.registrationDate),
  );
  const [nextHearingDate, setNextHearingDate] = useState(
    toDateInput(initialValues?.nextHearingDate),
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

    // safeToISOString never throws: empty/invalid input yields `undefined`
    // instead of a "RangeError: Invalid time value" crash during render.
    // Invalid dates are surfaced as inline validation errors instead.
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

      filingDate: safeToISOString(filingDate),
      registrationDate: safeToISOString(registrationDate),
      nextHearingDate: safeToISOString(nextHearingDate),

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
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Inline validation messages for the free-text date fields. A field the
  // user has typed into but that is not a valid date is flagged here —
  // validation is shown as UI, never as a JavaScript exception.
  const dateFieldErrors = useMemo(() => {
    const errFor = (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return undefined; // empty = optional, fine
      return parseValidDate(trimmed)
        ? undefined
        : "Use a valid date in YYYY-MM-DD format";
    };
    return {
      filingDate: errFor(filingDate),
      registrationDate: errFor(registrationDate),
      nextHearingDate: errFor(nextHearingDate),
    };
  }, [filingDate, registrationDate, nextHearingDate]);

  const submit = async () => {
    if (submitting) return; // double-submit guard
    setSubmitError(null);

    // Inline validation BEFORE any network request. Invalid data never
    // reaches the backend when it can be rejected locally; the backend
    // still validates independently.
    if (!caseTitle.trim()) {
      setSubmitError("Case Title is required.");
      return;
    }

    if (
      dateFieldErrors.filingDate ||
      dateFieldErrors.registrationDate ||
      dateFieldErrors.nextHearingDate
    ) {
      setSubmitError("Please correct the highlighted date fields before saving.");
      return;
    }

    setSubmitting(true);
    try {
      const tags = caseTagsCsv
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

      // Optional identifiers keep the meaning of "not provided": blank
      // fields are omitted entirely (never sent as ""). The backend then
      // auto-generates a case number for anonymous users when omitted.
      // (Sending `caseNumber: ""` used to cause POST /api/cases -> 400.)
      const trimmedCaseNumber = caseNumber.trim();
      const trimmedAssignedTo = assignedTo.trim();

      const base: any = {
        caseTitle: caseTitle.trim(),
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

      if (mode === "create" && trimmedCaseNumber) {
        base.caseNumber = trimmedCaseNumber;
      }
      if (trimmedAssignedTo) {
        base.assignedTo = trimmedAssignedTo;
      }

      // Optional dates keep the meaning of "not provided": only valid values
      // are sent; empty fields send nothing. safeToISOString never throws.
      const filingDateISO = safeToISOString(filingDate);
      const registrationDateISO = safeToISOString(registrationDate);
      const nextHearingDateISO = safeToISOString(nextHearingDate);
      if (filingDateISO) base.filingDate = filingDateISO;
      if (registrationDateISO) base.registrationDate = registrationDateISO;
      if (nextHearingDateISO) base.nextHearingDate = nextHearingDateISO;

      await onSubmit(base);
    } catch (err: any) {
      // Expected API/network failures surface as UI state, not a crash.
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
      setSubmitError(serverMessage || err?.message || "Could not save the case. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === "create" ? "Create Case" : "Edit Case"}
      </Text>

      {mode === "create" && (
        <Field
          label="Case Number (optional)"
          value={caseNumber}
          onChangeText={setCaseNumber}
          placeholder="Leave blank to auto-generate"
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}

      <Field
        label="Case Title *"
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

      <Field label="Client" value={client} onChangeText={setClient} autoCapitalize="words" autoCorrect={false} />
      <Field label="Advocate" value={advocate} onChangeText={setAdvocate} autoCapitalize="words" autoCorrect={false} />
      <Field label="Court" value={court} onChangeText={setCourt} autoCapitalize="words" autoCorrect={false} />
      <Field label="Judge" value={judge} onChangeText={setJudge} autoCapitalize="words" autoCorrect={false} />
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
        error={dateFieldErrors.filingDate}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numbers-and-punctuation"
      />
      <Field
        label="Registration Date"
        value={registrationDate}
        onChangeText={setRegistrationDate}
        placeholder="YYYY-MM-DD"
        error={dateFieldErrors.registrationDate}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numbers-and-punctuation"
      />
      <Field
        label="Next Hearing Date"
        value={nextHearingDate}
        onChangeText={setNextHearingDate}
        placeholder="YYYY-MM-DD"
        error={dateFieldErrors.nextHearingDate}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="numbers-and-punctuation"
      />

      <SelectField
        label="Current Stage"
        value={currentStage}
        options={CURRENT_STAGE_OPTIONS}
        onChange={setCurrentStage}
      />
      <SelectField
        label="Status"
        value={status}
        options={STATUS_OPTIONS}
        onChange={setStatus}
      />
      <SelectField
        label="Priority"
        value={priority}
        options={PRIORITY_OPTIONS}
        onChange={setPriority}
      />

      <View style={styles.field}>
        <Text style={styles.label} accessibilityRole="text">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Short description"
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { height: 90, textAlignVertical: "top" }]}
          multiline
          returnKeyType="default"
          accessibilityLabel="Description"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label} accessibilityRole="text">Important Notes</Text>
        <TextInput
          value={importantNotes}
          onChangeText={setImportantNotes}
          placeholder="Important notes"
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { height: 90, textAlignVertical: "top" }]}
          multiline
          returnKeyType="default"
          accessibilityLabel="Important Notes"
        />
      </View>

      <Field
        label="Case Tags"
        value={caseTagsCsv}
        onChangeText={setCaseTagsCsv}
        placeholder="tag1,tag2"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <View style={styles.submitRow}>
        {!!submitError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        )}
        <Pressable
          style={[styles.btn, submitting ? { opacity: 0.7 } : null]}
          onPress={submit}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel={submitLabel ?? (mode === "create" ? "Create case" : "Save changes")}
          accessibilityHint="Saves the case details"
          accessibilityState={{ disabled: submitting, busy: submitting }}
          hitSlop={8}
        >
          <Text style={styles.btnText}>
            {submitting ? "Saving..." : submitLabel ?? (mode === "create" ? "Create" : "Save")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    marginBottom: spacing.xs,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.accent.gold,
    fontWeight: typography.label.fontWeight,
    fontSize: typography.label.fontSize,
    letterSpacing: typography.label.letterSpacing,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.elevated,
    color: colors.text.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 16,
  },
  submitRow: {
    marginTop: spacing.xs,
  },
  btn: {
    backgroundColor: colors.accent.gold,
    borderWidth: 1,
    borderColor: colors.accent.goldDark,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: colors.text.inverse,
    fontWeight: typography.button.fontWeight,
    fontSize: typography.button.fontSize,
    letterSpacing: typography.button.letterSpacing,
  },
  inputError: {
    borderColor: colors.semantic.danger,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.elevated,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: colors.accent.goldSubtle,
    borderColor: colors.accent.gold,
  },
  chipText: {
    color: colors.text.secondary,
    fontWeight: typography.caption.fontWeight,
    fontSize: typography.caption.fontSize,
  },
  chipTextSelected: {
    color: colors.accent.gold,
    fontWeight: typography.caption.fontWeight,
  },
  errorBox: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.semantic.dangerSubtle,
    borderRadius: radii.md,
    backgroundColor: colors.semantic.dangerSubtle,
  },
  errorText: {
    color: colors.semantic.danger,
    fontWeight: typography.caption.fontWeight,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
});