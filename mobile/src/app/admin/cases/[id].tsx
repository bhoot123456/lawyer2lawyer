import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import GlassCard from "@/components/ui/GlassCard";
import { getAdminCaseById, updateAdminCase, archiveAdminCase, deleteAdminCase } from "@/services/adminApi";

type InfoRowProps = {
  label: string;
  value: string | number | undefined | null;
};

const InfoRow = ({ label, value }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "N/A"}</Text>
  </View>
);

export default function AdminCaseDetailScreen() {
  const { id } = useLocalSearchParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCase = useCallback(async () => {
    try {
      const res = await getAdminCaseById(id as string);
      if (res?.success) {
        setCaseData(res.data);
      }
    } catch (err) {
      console.error("Fetch case error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchCase();
    }, [fetchCase]),
  );

  const handleArchive = () => {
    Alert.alert("Archive Case", "Are you sure you want to archive this case?", [
      { text: "Cancel", style: "cancel" },
      { text: "Archive", onPress: async () => {
        try {
          const res = await archiveAdminCase(id as string);
          if (res?.success) fetchCase();
        } catch (err) {
          Alert.alert("Error", "Failed to archive case");
        }
      }},
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Delete Case", "Delete this case? Cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await deleteAdminCase(id as string);
          router.back();
        } catch (err) {
          Alert.alert("Error", "Failed to delete case");
        }
      }},
    ]);
  };

  const formatDate = (date: string | undefined | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Case Details" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color="#B58D3D" /></View>
      </View>
    );
  }

  if (!caseData) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Case Details" showBack />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Case not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader title={caseData.caseTitle || caseData.caseNumber} subtitle={caseData.caseNumber} showBack />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Overview Card */}
        <GlassCard>
          <View style={styles.overviewHeader}>
            <Text style={styles.caseTitle}>{caseData.caseTitle || caseData.caseNumber}</Text>
            <Text style={styles.caseNumber}>{caseData.caseNumber}</Text>
            <View style={styles.badgeRow}>
              {caseData.status && (
                <View style={[styles.badge, {
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  borderColor: "rgba(59, 130, 246, 0.3)",
                }]}>
                  <Text style={[styles.badgeText, { color: "#3B82F6" }]}>{caseData.status}</Text>
                </View>
              )}
              {caseData.priority && (
                <View style={[styles.badge, {
                  backgroundColor: caseData.priority === "Urgent" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                  borderColor: caseData.priority === "Urgent" ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)",
                }]}>
                  <Text style={[styles.badgeText, { color: caseData.priority === "Urgent" ? "#EF4444" : "#10B981" }]}>{caseData.priority}</Text>
                </View>
              )}
              {caseData.currentStage && (
                <View style={[styles.badge, {
                  backgroundColor: "rgba(139, 92, 246, 0.15)",
                  borderColor: "rgba(139, 92, 246, 0.3)",
                }]}>
                  <Text style={[styles.badgeText, { color: "#8B5CF6" }]}>{caseData.currentStage}</Text>
                </View>
              )}
            </View>
          </View>
        </GlassCard>

        {/* Parties */}
        <Text style={styles.sectionTitle}>Parties</Text>
        <GlassCard>
          {caseData.client ? <InfoRow label="Client" value={caseData.client} /> : null}
          {caseData.advocate ? <InfoRow label="Advocate" value={caseData.advocate} /> : null}
          {caseData.oppositeParty ? <InfoRow label="Opposite Party" value={caseData.oppositeParty} /> : null}
          {caseData.oppositeAdvocate ? <InfoRow label="Opposite Advocate" value={caseData.oppositeAdvocate} /> : null}
        </GlassCard>

        {/* Court & Dates */}
        <Text style={styles.sectionTitle}>Court & Dates</Text>
        <GlassCard>
          {caseData.court ? <InfoRow label="Court" value={caseData.court} /> : null}
          {caseData.judge ? <InfoRow label="Judge" value={caseData.judge} /> : null}
          {caseData.practiceArea ? <InfoRow label="Practice Area" value={caseData.practiceArea} /> : null}
          {caseData.caseType ? <InfoRow label="Case Type" value={caseData.caseType} /> : null}
          {caseData.filingDate ? <InfoRow label="Filing Date" value={formatDate(caseData.filingDate)} /> : null}
          {caseData.registrationDate ? <InfoRow label="Registration Date" value={formatDate(caseData.registrationDate)} /> : null}
          {caseData.nextHearingDate ? <InfoRow label="Next Hearing" value={formatDate(caseData.nextHearingDate)} /> : null}
        </GlassCard>

        {/* Assignment */}
        {caseData.assignedTo && (
          <>
            <Text style={styles.sectionTitle}>Assignment</Text>
            <GlassCard>
              {caseData.createdBy && (
                <InfoRow label="Created By" value={caseData.createdBy?.name || "N/A"} />
              )}
              <InfoRow label="Assigned To" value={caseData.assignedTo?.name || "N/A"} />
              {caseData.assignedTo?.email && (
                <InfoRow label="Assigned Email" value={caseData.assignedTo.email} />
              )}
              {caseData.assignedTo?.specialization && (
                <InfoRow label="Assigned Specialization" value={caseData.assignedTo.specialization} />
              )}
              {caseData.assignedTo?.phone && (
                <InfoRow label="Assigned Phone" value={caseData.assignedTo.phone} />
              )}
            </GlassCard>
          </>
        )}

        {/* Description */}
        {caseData.description ? (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <GlassCard>
              <Text style={styles.descriptionText}>{caseData.description}</Text>
            </GlassCard>
          </>
        ) : null}

        {/* Important Notes */}
        {caseData.importantNotes ? (
          <>
            <Text style={styles.sectionTitle}>Important Notes</Text>
            <GlassCard>
              <Text style={styles.descriptionText}>{caseData.importantNotes}</Text>
            </GlassCard>
          </>
        ) : null}

        {/* Case Tags */}
        {caseData.caseTags && caseData.caseTags.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Tags</Text>
            <GlassCard>
              <View style={styles.tagsRow}>
                {caseData.caseTags.map((tag: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </>
        )}

        {/* Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsWrap}>
          {caseData.status !== "Closed" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}
              onPress={handleArchive}
            >
              <Ionicons name="archive-outline" size={20} color="#F59E0B" />
              <Text style={[styles.actionBtnText, { color: "#F59E0B" }]}>Archive Case</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>Delete Case</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  errorText: { color: "#EF4444", fontSize: 14, fontWeight: "600", marginTop: 12 },
  sectionTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "900", marginTop: 4 },

  overviewHeader: { gap: 8 },
  caseTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "900" },
  caseNumber: { color: "#64748B", fontSize: 13, fontWeight: "600" },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 4, flexWrap: "wrap" },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: "800" },

  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(181, 141, 61, 0.06)" },
  infoLabel: { color: "#94A3B8", fontSize: 13, fontWeight: "600", flex: 1 },
  infoValue: { color: "#F8FAFC", fontSize: 13, fontWeight: "700", flex: 1, textAlign: "right" },

  descriptionText: { color: "#CBD5E1", fontSize: 13, fontWeight: "500", lineHeight: 20 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(181, 141, 61, 0.1)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.2)" },
  tagText: { color: "#B58D3D", fontSize: 12, fontWeight: "700" },

  actionsWrap: { gap: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.2)" },
  actionBtnText: { fontSize: 14, fontWeight: "800" },
});

