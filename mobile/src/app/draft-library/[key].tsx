import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

import GlassCard from "@/components/ui/GlassCard";
import {
  getDraftLibraryPhase11,
  saveDraft,
  getSavedDrafts,
} from "@/services/draftLibraryApi";

type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "date";
  default: string;
};

type Template = {
  id: string;
  label: string;
  fields: Field[];
  body: string;
};

type Section = {
  key: string;
  title: string;
  icon: string;
  description: string;
  templates?: Template[];
};

type SavedDraftDetail = {
  _id: string;
  templateId: string;
  title: string;
  filledFields: { key: string; value: any }[];
  customBody: string;
};

export default function DraftLibrarySectionScreen() {
  const { key, templateId, savedId } = useLocalSearchParams<{
    key: string;
    templateId?: string;
    savedId?: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [customBody, setCustomBody] = useState<string>("");
  const [previewMode, setPreviewMode] = useState(false);
  const [savedDraftsList, setSavedDraftsList] = useState<SavedDraftDetail[]>(
    [],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getDraftLibraryPhase11();
        setData(res);

        // Load saved drafts for this section
        const savedRes = await getSavedDrafts().catch(() => ({ drafts: [] }));
        const filtered = (savedRes?.drafts || []).filter(
          (d: any) => d.sectionKey === key,
        );
        setSavedDraftsList(filtered);

        // If templateId is specified, auto-select it
        if (templateId) {
          const allSections: Section[] = res?.sections || [];
          for (const sec of allSections) {
            const found = (sec.templates || []).find(
              (t) => t.id === templateId,
            );
            if (found) {
              setSelectedTemplate(found);
              // Initialize fields with defaults
              const initial: Record<string, string> = {};
              found.fields.forEach((f) => {
                initial[f.key] = f.default;
              });
              setFieldValues(initial);
              setCustomBody(found.body);

              // If savedId, load the saved values
              if (savedId) {
                const savedDoc = filtered.find(
                  (d: any) => d._id === savedId,
                );
                if (savedDoc) {
                  savedDoc.filledFields.forEach((ff: any) => {
                    initial[ff.key] = String(ff.value || "");
                  });
                  setFieldValues({ ...initial });
                  if (savedDoc.customBody) {
                    setCustomBody(savedDoc.customBody);
                  }
                }
              }
              break;
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [key, templateId, savedId]);

  const section: Section | undefined = useMemo(() => {
    const sections: Section[] = data?.sections || [];
    return sections.find((s) => s.key === key);
  }, [data, key]);

  const templates: Template[] = section?.templates || [];

  const handleSelectTemplate = (t: Template) => {
    setPreviewMode(false);
    setSelectedTemplate(t);
    const initial: Record<string, string> = {};
    t.fields.forEach((f) => {
      initial[f.key] = f.default;
    });
    setFieldValues(initial);
    setCustomBody(t.body);
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setPreviewMode(false);
  };

  // Replace all {{fieldKey}} placeholders with actual values
  const renderFinalBody = (body: string, values: Record<string, string>) => {
    let result = body;
    Object.entries(values).forEach(([k, v]) => {
      result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v || `[${k}]`);
    });
    return result;
  };

  const finalBody = useMemo(
    () => renderFinalBody(customBody || selectedTemplate?.body || "", fieldValues),
    [customBody, selectedTemplate, fieldValues],
  );

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      const payload = {
        templateId: selectedTemplate.id,
        sectionKey: key || "",
        title: selectedTemplate.label,
        filledFields: Object.entries(fieldValues).map(([k, v]) => ({
          key: k,
          value: v,
        })),
        customBody: customBody || selectedTemplate.body,
      };
      await saveDraft(payload);
      Alert.alert("Saved", "Your draft has been saved successfully.");
      // Refresh saved drafts list
      const savedRes = await getSavedDrafts().catch(() => ({ drafts: [] }));
      const filtered = (savedRes?.drafts || []).filter(
        (d: any) => d.sectionKey === key,
      );
      setSavedDraftsList(filtered);
    } catch (err) {
      Alert.alert("Error", "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  // Open template directly from saved list
  const handleOpenSaved = (saved: any) => {
    const t = templates.find((tmpl) => tmpl.id === saved.templateId);
    if (!t) {
      Alert.alert("Error", "Template not found for this saved draft.");
      return;
    }
    setSelectedTemplate(t);
    setPreviewMode(false);
    const initial: Record<string, string> = {};
    t.fields.forEach((f) => {
      initial[f.key] = f.default;
    });
    saved.filledFields.forEach((ff: any) => {
      initial[ff.key] = String(ff.value || "");
    });
    setFieldValues(initial);
    setCustomBody(saved.customBody || t.body);
  };

  return (
    <KeyboardAwareView contentContainerStyle={styles.container}>
      {/* Header */}
      <GlassCard borderColor="rgba(181, 141, 61, 0.35)" accent="#B58D3D">
        <View style={styles.headerRow}>
          <View style={styles.badgeIcon}>
            <Ionicons
              name={
                (section?.icon as any) || "document-text-outline"
              }
              size={20}
              color="#D4AF37"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {section?.title || "Draft Library"}
            </Text>
            <Text style={styles.subtitle}>
              {selectedTemplate
                ? `Editing: ${selectedTemplate.label}`
                : `${templates.length} template${templates.length !== 1 ? "s" : ""}`}
            </Text>
          </View>
        </View>
      </GlassCard>

      {loading ? (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator size="small" color="#B58D3D" />
        </View>
      ) : null}

      {!loading && !section ? (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.errorText}>Section not found.</Text>
          <Pressable
            onPress={() => router.push("/draft-library")}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>Back to Draft Library</Text>
          </Pressable>
        </View>
      ) : null}

      {section && !selectedTemplate ? (
        <>
          {/* Section Description */}
          {section.description ? (
            <View style={styles.descBox}>
              <Text style={styles.descText}>{section.description}</Text>
            </View>
          ) : null}

          {/* Saved Drafts for this section */}
          {savedDraftsList.length > 0 && (
            <View>
              <Text style={styles.sectionHeader}>
                Saved Drafts ({savedDraftsList.length})
              </Text>
              <View style={styles.savedMiniList}>
                {savedDraftsList.map((saved: any) => (
                  <Pressable
                    key={saved._id}
                    style={styles.savedMiniRow}
                    onPress={() => {
                      // Navigate to the same screen with query params
                      router.push(
                        `/draft-library/${key}?templateId=${saved.templateId}&savedId=${saved._id}` as any,
                      );
                    }}
                  >
                    <Ionicons
                      name="bookmark"
                      size={14}
                      color="#D4AF37"
                    />
                    <Text style={styles.savedMiniLabel} numberOfLines={1}>
                      {saved.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.sectionHeader}>Select a Template</Text>

          {templates.length ? (
            <View style={styles.templateList}>
              {templates.map((t) => (
                <Pressable
                  key={t.id}
                  style={({ pressed }) => [
                    styles.templateRow,
                    pressed ? { opacity: 0.92 } : null,
                  ]}
                  onPress={() => handleSelectTemplate(t)}
                >
                  <View style={styles.templateIconWrap}>
                    <Ionicons
                      name="document-outline"
                      size={16}
                      color="#B58D3D"
                    />
                  </View>
                  <Text style={styles.templateLabel} numberOfLines={2}>
                    {t.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(181,141,61,0.6)"
                  />
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No templates in this section yet.</Text>
          )}

          <Pressable
            style={styles.backBtn}
            onPress={() => router.push("/draft-library")}
          >
            <Ionicons name="arrow-back-outline" size={16} color="#B58D3D" />
            <Text style={styles.backText}>Back to Draft Library</Text>
          </Pressable>
        </>
      ) : null}

      {/* Template Editor */}
      {selectedTemplate && (
        <View style={styles.editorContainer}>
          {/* Action Buttons */}
          <View style={styles.editorActions}>
            <Pressable
              style={styles.actionBtn}
              onPress={handleBackToTemplates}
            >
              <Ionicons name="arrow-back-outline" size={16} color="#B58D3D" />
              <Text style={styles.actionBtnText}>Back</Text>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => setPreviewMode(!previewMode)}
            >
              <Ionicons
                name={previewMode ? "create-outline" : "eye-outline"}
                size={16}
                color="#B58D3D"
              />
              <Text style={styles.actionBtnText}>
                {previewMode ? "Edit" : "Preview"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, styles.saveBtn]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#D4AF37" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={16} color="#D4AF37" />
                  <Text style={[styles.actionBtnText, { color: "#D4AF37" }]}>
                    Save
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Preview Mode */}
          {previewMode ? (
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Document Preview</Text>
              <ScrollView
                style={styles.previewScroll}
                nestedScrollEnabled
              >
                <Text style={styles.previewBody}>{finalBody}</Text>
              </ScrollView>
            </View>
          ) : (
            <>
              {/* Editable Fields */}
              <Text style={styles.sectionHeader}>Fill in the Fields</Text>
              <View style={styles.fieldsContainer}>
                {selectedTemplate.fields.map((field) => (
                  <View key={field.key} style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    {field.type === "textarea" ? (
                      <TextInput
                        style={styles.textarea}
                        value={fieldValues[field.key] || ""}
                        onChangeText={(text) =>
                          setFieldValues((prev) => ({
                            ...prev,
                            [field.key]: text,
                          }))
                        }
                        multiline
                        numberOfLines={4}
                        placeholderTextColor="rgba(248,250,252,0.35)"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    ) : (
                      <TextInput
                        style={styles.textInput}
                        value={fieldValues[field.key] || ""}
                        onChangeText={(text) =>
                          setFieldValues((prev) => ({
                            ...prev,
                            [field.key]: text,
                          }))
                        }
                        placeholderTextColor="rgba(248,250,252,0.35)"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                  </View>
                ))}
              </View>

              {/* Editable Body */}
              <Text style={styles.sectionHeader}>Customize Body (Optional)</Text>
              <TextInput
                style={styles.bodyEditor}
                value={customBody}
                onChangeText={setCustomBody}
                multiline
                numberOfLines={10}
                placeholderTextColor="rgba(248,250,252,0.35)"
                placeholder="You can edit the document body directly. Use {{fieldKey}} for placeholders."
              />
            </>
          )}

          <View style={{ height: 16 }} />
        </View>
      )}
    </KeyboardAwareView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 110,
    backgroundColor: "#0B0B0B",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(181,141,61,0.12)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(248,250,252,0.75)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
    lineHeight: 16,
  },
  descBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.20)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  descText: {
    color: "rgba(248,250,252,0.82)",
    fontWeight: "800",
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 14,
    marginTop: 4,
  },
  templateList: {
    gap: 10,
  },
  templateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.18)",
    backgroundColor: "rgba(181,141,61,0.08)",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  templateIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(181,141,61,0.12)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  templateLabel: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  emptyText: {
    color: "rgba(248,250,252,0.65)",
    fontWeight: "800",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    backgroundColor: "rgba(181,141,61,0.10)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.35)",
    paddingVertical: 12,
  },
  backText: {
    color: "rgba(181,141,61,0.95)",
    fontWeight: "900",
  },
  errorText: {
    color: "rgba(248,250,252,0.75)",
    fontWeight: "900",
    marginBottom: 12,
  },
  // Saved draft mini list
  savedMiniList: {
    gap: 8,
    marginTop: 8,
  },
  savedMiniRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.15)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 10,
  },
  savedMiniLabel: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 12,
    flex: 1,
  },
  // Editor
  editorContainer: {
    gap: 12,
  },
  editorActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    backgroundColor: "rgba(181,141,61,0.10)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.35)",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  saveBtn: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(181,141,61,0.20)",
    borderColor: "rgba(181,141,61,0.55)",
  },
  actionBtnText: {
    color: "#B58D3D",
    fontWeight: "900",
    fontSize: 12,
  },
  fieldsContainer: {
    gap: 12,
  },
  fieldRow: {
    gap: 6,
  },
  fieldLabel: {
    color: "rgba(248,250,252,0.85)",
    fontWeight: "900",
    fontSize: 12,
    marginLeft: 2,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textarea: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
    textAlignVertical: "top",
  },
  bodyEditor: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 180,
    textAlignVertical: "top",
    lineHeight: 18,
    fontFamily: "monospace",
  },
  previewBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.20)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  previewTitle: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 13,
    marginBottom: 10,
  },
  previewScroll: {
    maxHeight: 400,
  },
  previewBody: {
    color: "rgba(248,250,252,0.88)",
    fontWeight: "800",
    fontSize: 11,
    lineHeight: 17,
    fontFamily: "monospace",
  },
});