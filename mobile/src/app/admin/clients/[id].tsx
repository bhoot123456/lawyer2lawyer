import React, { useState, useCallback } from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import GlassCard from "@/components/ui/GlassCard";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getAdminClientById, updateAdminClient, deleteAdminClient } from "@/services/adminApi";

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

export default function AdminClientDetailScreen() {
  const { id } = useLocalSearchParams();
  const [client, setClient] = useState<any>(null);
  const [consultationHistory, setConsultationHistory] = useState<any[]>([]);
  const [casesCount, setCasesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  // Cross-platform confirm/notice dialogs (Alert.alert is a no-op on web).
  const { confirm: confirmDialog, notice: noticeDialog, element: dialogElement } = useConfirmDialog();

  const fetchClient = useCallback(async () => {
    try {
      const res = await getAdminClientById(id as string);
      if (res?.success) {
        setClient(res.data.client);
        setConsultationHistory(res.data.consultationHistory || []);
        setCasesCount(res.data.casesCount || 0);
      }
    } catch (err) {
      console.error("Fetch client error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchClient();
    }, [fetchClient]),
  );

  const handleToggleActive = async () => {
    try {
      const res = await updateAdminClient(id as string, { isActive: !client.isActive });
      if (res?.success) setClient(res.data);
    } catch (err) {
      void noticeDialog({ title: "Error", message: "Failed to update client status", danger: true });
    }
  };

  const handleDelete = () => {
    void (async () => {
      // Shared ConfirmDialog renders on web too (RN Alert.alert is a no-op there).
      const ok = await confirmDialog({
        title: "Delete Client",
        message: `Delete ${client.name}? This cannot be undone.`,
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok) return;
      try {
        await deleteAdminClient(id as string);
        router.back();
      } catch (err) {
        void noticeDialog({ title: "Error", message: "Failed to delete client", danger: true });
      }
    })();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Client Details" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent.gold} /></View>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Client Details" showBack />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Client not found</Text>
        </View>
      </View>
    );
  }

  return (
    <>
    <View style={styles.container}>
      <AdminHeader title={client.name} subtitle={client.email} showBack />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <GlassCard>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{client.name?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{client.name}</Text>
              <Text style={styles.profileEmail}>{client.email}</Text>
              <View style={[styles.statusIndicator, {
                backgroundColor: client.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                borderColor: client.isActive ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
              }]}>
                <View style={[styles.statusDot, { backgroundColor: client.isActive ? "#10B981" : "#EF4444" }]} />
                <Text style={[styles.statusText, { color: client.isActive ? "#10B981" : "#EF4444" }]}>
                  {client.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{casesCount}</Text>
              <Text style={styles.statLabel}>Cases</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{consultationHistory.length}</Text>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
          </View>
        </GlassCard>

        {/* Personal Info */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <GlassCard>
          <InfoRow label="Phone" value={client.phone} />
          <InfoRow label="Email" value={client.email} />
          <InfoRow label="City" value={client.city} />
          <InfoRow label="State" value={client.state} />
          {client.about ? <InfoRow label="About" value={client.about} /> : null}
        </GlassCard>

        {/* Account Info */}
        <Text style={styles.sectionTitle}>Account</Text>
        <GlassCard>
          <InfoRow label="Role" value={client.role} />
          <InfoRow label="Joined" value={client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "N/A"} />
          <InfoRow label="Suspended" value={client.isSuspended ? "Yes" : "No"} />
        </GlassCard>

        {/* Consultation History */}
        {consultationHistory.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Consultation History</Text>
            <GlassCard>
              {consultationHistory.map((booking: any, idx: number) => (
                <View key={idx} style={styles.consultationRow}>
                  <View style={styles.consultationInfo}>
                    <Text style={styles.consultationLawyer}>
                      {booking.lawyer?.name || "Unknown Lawyer"}
                    </Text>
                    <Text style={styles.consultationDate}>
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ""}
                    </Text>
                  </View>
                  {booking.status && (
                    <View style={[styles.miniBadge, {
                      backgroundColor: booking.status === "confirmed" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                      borderColor: booking.status === "confirmed" ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)",
                    }]}>
                      <Text style={[styles.miniBadgeText, {
                        color: booking.status === "confirmed" ? "#10B981" : "#F59E0B",
                      }]}>{booking.status}</Text>
                    </View>
                  )}
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {/* Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsWrap}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: client.isActive ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)" }]}
            onPress={handleToggleActive}
          >
            <Ionicons name={client.isActive ? "pause-circle-outline" : "play-circle-outline"} size={20} color={client.isActive ? "#F59E0B" : "#10B981"} />
            <Text style={[styles.actionBtnText, { color: client.isActive ? "#F59E0B" : "#10B981" }]}>
              {client.isActive ? "Suspend Account" : "Activate Account"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>Delete Client</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {dialogElement}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  errorText: { color: "#EF4444", fontSize: 14, fontWeight: "600", marginTop: 12 },
  sectionTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "800", marginTop: 4 },

  profileHeader: { flexDirection: "row", gap: 16, alignItems: "center", marginBottom: 16 },
  profileAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accent.goldLight, alignItems: "center", justifyContent: "center" },
  profileAvatarText: { color: colors.accent.gold, fontSize: 24, fontWeight: "800" },
  profileInfo: { flex: 1 },
  profileName: { color: "#F8FAFC", fontSize: 18, fontWeight: "800" },
  profileEmail: { color: "#94A3B8", fontSize: 12, fontWeight: "600", marginTop: 2 },
  statusIndicator: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, borderWidth: 1, marginTop: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "800" },

  statsRow: { flexDirection: "row", justifyContent: "space-around", paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.accent.goldLight },
  statItem: { alignItems: "center" },
  statValue: { color: "#F8FAFC", fontSize: 18, fontWeight: "800" },
  statLabel: { color: "#64748B", fontSize: 12, fontWeight: "700" },

  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.accent.goldSubtle },
  infoLabel: { color: "#94A3B8", fontSize: 12, fontWeight: "600", flex: 1 },
  infoValue: { color: "#F8FAFC", fontSize: 12, fontWeight: "700", flex: 1, textAlign: "right" },

  consultationRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.accent.goldSubtle },
  consultationInfo: { flex: 1 },
  consultationLawyer: { color: "#F8FAFC", fontSize: 12, fontWeight: "700" },
  consultationDate: { color: "#64748B", fontSize: 12, fontWeight: "600", marginTop: 2 },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  miniBadgeText: { fontSize: 10, fontWeight: "800", textTransform: "capitalize" },

  actionsWrap: { gap: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border.goldLight },
  actionBtnText: { fontSize: 14, fontWeight: "800" },
});

