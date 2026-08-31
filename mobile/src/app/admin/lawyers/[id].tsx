import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import GlassCard from "@/components/ui/GlassCard";
import { getAdminLawyerById, updateAdminLawyer, verifyLawyer } from "@/services/adminApi";

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

export default function AdminLawyerDetailScreen() {
  const { id } = useLocalSearchParams();
  const [lawyer, setLawyer] = useState<any>(null);
  const [casesCount, setCasesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLawyer = useCallback(async () => {
    try {
      const res = await getAdminLawyerById(id as string);
      if (res?.success) {
        setLawyer(res.data.lawyer);
        setCasesCount(res.data.casesCount);
      }
    } catch (err) {
      console.error("Fetch lawyer error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchLawyer();
    }, [fetchLawyer]),
  );

  const handleToggleActive = async () => {
    try {
      const res = await updateAdminLawyer(id as string, { isActive: !lawyer.isActive });
      if (res?.success) setLawyer(res.data);
    } catch (err) {
      Alert.alert("Error", "Failed to update lawyer status");
    }
  };

  const handleVerify = async (status: string) => {
    try {
      const res = await verifyLawyer(id as string, status);
      if (res?.success) setLawyer(res.data);
    } catch (err) {
      Alert.alert("Error", "Failed to verify lawyer");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Lawyer Details" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color="#B58D3D" /></View>
      </View>
    );
  }

  if (!lawyer) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Lawyer Details" showBack />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Lawyer not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader title={lawyer.name} subtitle={lawyer.specialization} showBack />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <GlassCard>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{lawyer.name?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{lawyer.name}</Text>
              <Text style={styles.profileEmail}>{lawyer.email}</Text>
              <View style={[styles.badge, {
                backgroundColor: lawyer.verificationStatus === "verified" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                borderColor: lawyer.verificationStatus === "verified" ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)",
              }]}>
                <Text style={[styles.badgeText, {
                  color: lawyer.verificationStatus === "verified" ? "#10B981" : "#F59E0B",
                }]}>{lawyer.verificationStatus}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{casesCount}</Text>
              <Text style={styles.statLabel}>Cases</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{lawyer.experience || 0}y</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{lawyer.ratings || "—"}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </GlassCard>

        {/* Personal Info */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <GlassCard>
          <InfoRow label="Phone" value={lawyer.phone} />
          <InfoRow label="Email" value={lawyer.email} />
          <InfoRow label="City" value={lawyer.city} />
          <InfoRow label="State" value={lawyer.state} />
          <InfoRow label="Specialization" value={lawyer.specialization} />
          <InfoRow label="Bar Council Number" value={lawyer.barCouncilNumber} />
          <InfoRow label="Consultation Fee" value={lawyer.consultationFee ? `₹${lawyer.consultationFee}` : "N/A"} />
          <InfoRow label="About" value={lawyer.about} />
        </GlassCard>

        {/* Courts */}
        {lawyer.courts && lawyer.courts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Practicing Courts</Text>
            <GlassCard>
              <View style={styles.tagsRow}>
                {lawyer.courts.map((court: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{court}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </>
        )}

        {/* Documents */}
        {lawyer.documents && lawyer.documents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Documents</Text>
            <GlassCard>
              {lawyer.documents.map((doc: any, idx: number) => (
                <View key={idx} style={styles.docRow}>
                  <Ionicons name="document-outline" size={18} color="#B58D3D" />
                  <Text style={styles.docName}>{doc.name}</Text>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {/* Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsWrap}>
          {lawyer.verificationStatus === "pending" && (
            <>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]} onPress={() => handleVerify("verified")}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                <Text style={[styles.actionBtnText, { color: "#10B981" }]}>Verify Lawyer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]} onPress={() => handleVerify("rejected")}>
                <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>Reject Lawyer</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: lawyer.isActive ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)" }]}
            onPress={handleToggleActive}
          >
            <Ionicons name={lawyer.isActive ? "pause-circle-outline" : "play-circle-outline"} size={20} color={lawyer.isActive ? "#F59E0B" : "#10B981"} />
            <Text style={[styles.actionBtnText, { color: lawyer.isActive ? "#F59E0B" : "#10B981" }]}>
              {lawyer.isActive ? "Suspend Account" : "Activate Account"}
            </Text>
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

  profileHeader: { flexDirection: "row", gap: 16, alignItems: "center", marginBottom: 16 },
  profileAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(181, 141, 61, 0.15)", alignItems: "center", justifyContent: "center" },
  profileAvatarText: { color: "#B58D3D", fontSize: 24, fontWeight: "900" },
  profileInfo: { flex: 1 },
  profileName: { color: "#F8FAFC", fontSize: 18, fontWeight: "900" },
  profileEmail: { color: "#94A3B8", fontSize: 13, fontWeight: "600", marginTop: 2 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, borderWidth: 1, marginTop: 6 },
  badgeText: { fontSize: 11, fontWeight: "800", textTransform: "capitalize" },

  statsRow: { flexDirection: "row", justifyContent: "space-around", paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(181, 141, 61, 0.1)" },
  statItem: { alignItems: "center" },
  statValue: { color: "#F8FAFC", fontSize: 18, fontWeight: "900" },
  statLabel: { color: "#64748B", fontSize: 11, fontWeight: "700" },

  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(181, 141, 61, 0.06)" },
  infoLabel: { color: "#94A3B8", fontSize: 13, fontWeight: "600", flex: 1 },
  infoValue: { color: "#F8FAFC", fontSize: 13, fontWeight: "700", flex: 1, textAlign: "right" },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(181, 141, 61, 0.1)", borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.2)" },
  tagText: { color: "#B58D3D", fontSize: 12, fontWeight: "700" },

  docRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  docName: { color: "#F8FAFC", fontSize: 13, fontWeight: "600", flex: 1 },

  actionsWrap: { gap: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(181, 141, 61, 0.2)" },
  actionBtnText: { fontSize: 14, fontWeight: "800" },
});