import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import { cmsGet, cmsCreate, cmsUpdate, getCmsModules } from "@/services/adminApi";

/** Fields never shown/editable in the generic form. */
const HIDDEN_FIELDS = new Set([
  "_id", "__v", "createdAt", "updatedAt", "isDeleted", "deletedAt",
  "deletedBy", "publishedAt", "views", "likes", "slug",
]);

const SECTIONS: { title: string; match: RegExp }[] = [
  { title: "Basic Information", match: /^(title|name|label|actName|shortName|courtRoom|judgeName|caseTitle|description|excerpt|content)$/ },
  { title: "Classification", match: /(category|sectionKey|sectionTitle|sectionIcon|sectionDescription|state|district|jurisdiction|type|topic|year|ministry|language|tags|bench|designation)/ },
  { title: "Contact & Links", match: /(email|phone|fax|address|city|pincode|pinCode|website|url|pdfUrl|vcLink|meetingId|googleMapsLink|Link$|latitude|longitude)/ },
  { title: "Court Information", match: /(holidayDate|causeListDate|effectiveFrom|effectiveTo|workingDays|workingHours|filingMode|causeStage|parties|leaveFrom|leaveTo|leaveReason|isOnLeave|complexId|districtId|courtId|displayOrder)/ },
  { title: "Publication", match: /^(status|isActive|isFeatured|principalBench|circuitBench|eFilingAvailable|videoConferenceAvailable|isPopular|isNewLaw|readTime|coverImage)$/ },
  { title: "Verification & Source", match: /(source|verif|lastVerified|verifiedBy|versionNumber|changeSummary|dataVersion|statusNote)/ },
];

function sectionOf(field: string) {
  for (const s of SECTIONS) if (s.match.test(field)) return s.title;
  return "Advanced Metadata";
}

function labelOf(field: string) {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export default function CmsRecordScreen() {
  const params = useLocalSearchParams<{ module: string; id: string }>();
  const moduleKey = params.module;
  const recordId = params.id;
  const isNew = recordId === "new";

  const [original, setOriginal] = useState<Record<string, any> | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  // Registry allowlist drives which fields the editor may render/write.
  const [allowedFields, setAllowedFields] = useState<string[]>([]);
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // Editable fields are driven by the server-side CMS registry allowlist
  // (the authoritative contract) so the editor never submits fields the
  // CMS does not permit — e.g. `status` on modules with no workflow status
  // field, or schema-only metadata such as `dataSource` that round-trips
  // from GET but is not CMS-editable. Until it loads, fall back to HIDDEN_FIELDS.
  const fields = useMemo(() => {
    const keys = allowedFields.length > 0 ? allowedFields : Object.keys(form);
    return keys.filter((k) => !HIDDEN_FIELDS.has(k) && !k.startsWith("$"));
  }, [form, allowedFields]);

  useEffect(() => {
    if (isNew || !recordId) return;
    (async () => {
      try {
        const res = await cmsGet(moduleKey, recordId);
        if (res?.success) {
          setOriginal(res.data);
          setForm(res.data);
        } else setError("Record not found");
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load record");
      } finally {
        setLoading(false);
      }
    })();
  }, [moduleKey, recordId, isNew]);

  // New records start with an empty form: the rendered field set comes from
// the registry allowlist (loaded below), NOT from a hardcoded skeleton.
// (A hardcoded { status: "draft" } starter previously leaked a
// non-CMS-editable field into every create payload and caused 400s.)



  // Load the registry allowlist for this module — the source of truth for
  // which fields the editor may read/edit/write. Save stays disabled until
  // this resolves so the editor never submits a field the backend would
  // (correctly) reject as an unknown/restricted field.
  useEffect(() => {
    let cancelled = false;
    getCmsModules()
      .then((mods) => {
        const m = mods.find((mod) => mod.key === moduleKey);
        if (!cancelled && m?.allowedFields) setAllowedFields(m.allowedFields);
        if (!cancelled) setMetaLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setMetaLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [moduleKey]);

  const dirty = useMemo(() => {
    if (!original) return Object.keys(form).some((k) => form[k] !== undefined && form[k] !== "");
    return JSON.stringify(cleanForCompare(form)) !== JSON.stringify(cleanForCompare(original));
  }, [form, original]);

  function cleanForCompare(o: Record<string, any>) {
    const allowSet = allowedFields.length > 0 ? new Set(allowedFields) : null;
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(o)) {
      if (HIDDEN_FIELDS.has(k)) continue;
      // Only compare fields the registry permits, so round-tripped
      // schema-only/system fields (e.g. `dataSource`) do not falsely
      // mark the form dirty.
      if (allowSet && !allowSet.has(k)) continue;
      out[k] = v instanceof Date ? v.toISOString() : v;
    }
    return out;
  }

  const requestBack = useCallback(() => {
    if (dirty) setShowUnsavedDialog(true);
    else router.back();
  }, [dirty]);

  // Android hardware back guard (Part 20 — never silently lose changes).
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      requestBack();
      return true;
    });
    return () => sub.remove();
  }, [requestBack]);

  const setValue = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  // Render a structured backend validation error as a readable message so
  // field-specific failures surface instead of a bare 'Server Error'.
  function describeError(data: any) {
    if (!data) return "Save failed";
    if (data?.errors?.length) {
      return (
        (data.message || "Validation failed") +
        ": " +
        data.errors
          .map(
            (er: { field?: string; message?: string }) =>
              `${(er.field ? er.field + " — " : "")}${(er.message || "invalid")}`
          )
          .join(", ")
      );
    }
    return data.message || "Save failed";
  }

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      // Fields are already constrained to the registry allowlist (see the
      // `fields` memo), so `payload` never carries disallowed keys.
      const payload: Record<string, any> = {};
      for (const f of fields) payload[f] = form[f];
      let res;
      if (isNew) {
        res = await cmsCreate(moduleKey, payload);
      } else {
        payload.expectedUpdatedAt =
          original?.updatedAt instanceof Date
            ? original.updatedAt.toISOString()
            : original?.updatedAt;
        res = await cmsUpdate(moduleKey, recordId, payload);
      }
      if (res?.success) {
        setSuccessMsg(isNew ? "Created successfully" : "Saved successfully");
        setOriginal(res.data);
        setForm(res.data);
        setTimeout(() => router.back(), 600);
      } else {
        setError(describeError(res));
      }
    } catch (e: any) {
      const data = e?.response?.data;
      // Stale-record concurrency conflict -> reload so the admin sees the
      // latest version before they lose edits.
      if (e?.response?.status === 409) {
        try {
          const fresh = await cmsGet(moduleKey, recordId);
          if (fresh?.success) {
            setOriginal(fresh.data);
            setForm(fresh.data);
          }
        } catch (_) {
          /* ignore reload failure */
        }
        setError("This record was modified by another administrator. Reload before saving.");
        return;
      }
      setError(describeError(data) || e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Group editable fields into form sections.
  const grouped = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const f of fields) {
      const s = sectionOf(f);
      (groups[s] ||= []).push(f);
    }
    return groups;
  }, [fields]);

  const renderField = (field: string) => {
    const value = form[field];
    if (typeof value === "boolean" || value === undefined && /^(is|has|can|principal|circuit|e[A-Z])/.test(field)) {
      return (
        <View key={field} style={s.fieldRow}>
          <Text style={s.fieldLabel}>{labelOf(field)}</Text>
          <Switch
            value={!!value}
            onValueChange={(v) => setValue(field, v)}
            trackColor={{ false: "#334155", true: "#B58D3D" }}
            thumbColor="#F8FAFC"
          />
        </View>
      );
    }
    const isLong = typeof value === "string" && (value.length > 80 || /description|content/i.test(field));
    return (
      <View key={field} style={s.fieldWrap}>
        <Text style={s.fieldLabel}>{labelOf(field)}</Text>
        <TextInput
          style={[s.input, isLong && styles.multiline]}
          value={value === null || value === undefined ? "" : String(value)}
          onChangeText={(t) => setValue(field, t)}
          multiline={isLong}
          numberOfLines={isLong ? 4 : 1}
          placeholderTextColor="#475569"
          autoCapitalize="none"
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Loading..." showBack />
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#B58D3D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader
        title={isNew ? `New record` : String(form.title || form.name || form.label || form.judgeName || form.courtRoom || recordId)}
        subtitle={dirty ? "Unsaved changes" : "All changes saved"}
        showBack
        onBack={requestBack}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {error !== "" && <Text style={styles.error}>{error}</Text>}
        {successMsg !== "" && <Text style={styles.success}>{successMsg}</Text>}

        {!isNew && (
          <View style={styles.metaCard}>
            <MetaRow label="Status" value={String(form.status ?? "—")} />
            {form.updatedAt && <MetaRow label="Last updated" value={new Date(form.updatedAt).toLocaleString()} />}
            {form.lastVerifiedAt && <MetaRow label="Last verified" value={new Date(form.lastVerifiedAt).toLocaleDateString()} />}
            {form.verificationStatus ? <MetaRow label="Verification" value={String(form.verificationStatus)} /> : null}
            {!!form.sourceName && <MetaRow label="Source" value={String(form.sourceName)} />}
          </View>
        )}

        {Object.entries(grouped).map(([section, fieldNames]) => (
          <View key={section} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section}</Text>
            {fieldNames.map(renderField)}
          </View>
        ))}
      </ScrollView>

      {/* Sticky save bar */}
      <View style={styles.saveBar}>
        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={requestBack} disabled={saving}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.saveBtn, (!dirty || !metaLoaded) && saving !== true && styles.disabled]}
          onPress={save}
          disabled={saving || !metaLoaded}
        >
          {saving ? <ActivityIndicator size="small" color="#0B0B0B" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <AdminConfirmDialog
        visible={showUnsavedDialog}
        title="Discard unsaved changes?"
        message="You have unsaved changes. Leaving this screen now will lose them."
        confirmLabel="Discard"
        danger
        onConfirm={() => { setShowUnsavedDialog(false); router.back(); }}
        onCancel={() => setShowUnsavedDialog(false)}
      />
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={s.metaValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

// local namespace to avoid clashing with outer `styles`
const s = StyleSheet.create({
  fieldRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  fieldLabel: { color: "#CBD5E1", fontSize: 13, fontWeight: "700", flex: 1 },
  fieldWrap: { marginBottom: 12 },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
    borderColor: "rgba(181,141,61,0.2)", borderRadius: 10,
    color: "#F8FAFC", paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, fontWeight: "600", marginTop: 4,
  },
  metaRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  metaLabel: { color: "#64748B", fontSize: 12, fontWeight: "700" },
  metaValue: { color: "#94A3B8", fontSize: 12, fontWeight: "600", maxWidth: "60%", textAlign: "right" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  error: { color: "#EF4444", fontWeight: "800", marginBottom: 12, textAlign: "center" },
  success: { color: "#10B981", fontWeight: "800", marginBottom: 12, textAlign: "center" },
  metaCard: {
    backgroundColor: "rgba(18,18,20,0.6)", borderRadius: 14, borderWidth: 1,
    borderColor: "rgba(181,141,61,0.15)", padding: 14, marginBottom: 14,
  },
  sectionCard: {
    backgroundColor: "rgba(18,18,20,0.6)", borderRadius: 14, borderWidth: 1,
    borderColor: "rgba(181,141,61,0.15)", padding: 14, marginBottom: 14,
  },
  sectionTitle: {
    color: "#B58D3D", fontSize: 13, fontWeight: "900", textTransform: "uppercase",
    letterSpacing: 0.5, marginBottom: 10,
  },
  saveBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", gap: 10, padding: 16,
    backgroundColor: "rgba(11,11,11,0.95)", borderTopWidth: 1,
    borderTopColor: "rgba(181,141,61,0.15)",
  },
  btn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12 },
  cancelBtn: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(148,163,184,0.25)" },
  cancelBtnText: { color: "#94A3B8", fontWeight: "800" },
  saveBtn: { backgroundColor: "#B58D3D" },
  saveBtnText: { color: "#0B0B0B", fontWeight: "900" },
  disabled: { opacity: 0.9 },
});
