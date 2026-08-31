import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import SearchBar from "@/components/admin/SearchBar";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import {
  getAdminUserAccounts,
  createAdminUser,
  updateAdminUser,
  getPermissionCatalog,
  type AdminUserRecord,
} from "@/services/adminApi";

export default function AdminUsersScreen() {
  const { has, profile, loading: permLoading } = useAdminPermissions();
  const canView = has("admin_users.view");
  const isSuper = !!profile?.isSuperAdmin;

  const [admins, setAdmins] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<AdminUserRecord | null>(null);
  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof getPermissionCatalog>> | null>(null);
  const [permDraft, setPermDraft] = useState<Record<string, boolean>>({});
  const [typeDraft, setTypeDraft] = useState<string>("");
  const [savingPerms, setSavingPerms] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<AdminUserRecord | null>(null);

  const fetchData = useCallback(async () => {
    if (!canView) { setLoading(false); return; }
    try {
      setError("");
      const res = await getAdminUserAccounts({
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      if (res?.success) setAdmins(res.data.admins || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load administrators");
    } finally {
      setLoading(false);
    }
  }, [canView, search, statusFilter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData]),
  );

  useEffect(() => {
    const t = setTimeout(fetchData, 350);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  const openDetail = async (admin: AdminUserRecord) => {
    setSelected(admin);
    setTypeDraft(admin.adminType || "");
    setPermDraft({});
    if (!catalog) {
      try { setCatalog(await getPermissionCatalog()); } catch {}
    }
  };

  const savePermissions = async () => {
    if (!selected || Object.keys(permDraft).length === 0) return;
    setSavingPerms(true);
    try {
      await updateAdminUser(selected._id, {
        adminType: typeDraft !== selected.adminType ? typeDraft : undefined,
        permissions: permDraft,
      });
      setSelected(null);
      fetchData();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to save permissions");
    } finally {
      setSavingPerms(false);
    }
  };

  const toggleSuspend = async () => {
    if (!suspendTarget) return;
    try {
      await updateAdminUser(suspendTarget._id, {
        isSuspended: !suspendTarget.isSuspended,
        isActive: suspendTarget.isSuspended ? true : suspendTarget.isActive,
      });
      setSuspendTarget(null);
      fetchData();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Action failed");
      setSuspendTarget(null);
    }
  };

  if (!permLoading && !canView) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Admin Users" showBack />
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={44} color="#EF4444" />
          <Text style={styles.noAccess}>You don&apos;t have permission to view administrators.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader title="Admin Users" subtitle="Administrators & permissions" showBack />
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search admins..." />
        <View style={styles.filterRow}>
          {["", "active", "inactive", "suspended"].map((st) => (
            <TouchableOpacity key={st || "all"}
              style={[styles.filterChip, statusFilter === st && styles.filterChipActive]}
              onPress={() => setStatusFilter(st)}>
              <Text style={[styles.filterChipText, statusFilter === st && styles.filterChipTextActive]}>
                {st || "All"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#B58D3D" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }}>
          {admins.map((admin) => (
            <View key={admin._id} style={styles.card}>
              <TouchableOpacity onPress={() => openDetail(admin)}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.adminName}>{admin.name}</Text>
                    <Text style={styles.adminEmail}>{admin.email}</Text>
                    <Text style={styles.adminMeta}>
                      {admin.adminType || "legacy admin"}
                      {admin.lastLoginAt
                        ? ` • last login ${new Date(admin.lastLoginAt).toLocaleDateString()}`
                        : ""}
                    </Text>
                  </View>
                  {admin.isSuspended
                    ? <AdminStatusBadge status="Suspended" />
                    : admin.isActive
                      ? <AdminStatusBadge status="Active" />
                      : <AdminStatusBadge status="Inactive" />}
                </View>
              </TouchableOpacity>
              {isSuper && (
                <TouchableOpacity
                  style={[styles.chip, { alignSelf: "flex-start", marginTop: 10 }]}
                  onPress={() => setSuspendTarget(admin)}
                >
                  <Ionicons name="ban-outline" size={14} color={admin.isSuspended ? "#10B981" : "#EF4444"} />
                  <Text style={[styles.chipText, { color: admin.isSuspended ? "#10B981" : "#EF4444" }]}>
                    {admin.isSuspended ? "Unsuspend" : "Suspend"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Permission editor modal */}
      <AdminPermissionEditor
        visible={!!selected}
        admin={selected}
        catalog={catalog}
        typeDraft={typeDraft}
        setTypeDraft={setTypeDraft}
        permDraft={permDraft}
        togglePerm={(perm: string) =>
          setPermDraft((d) => {
            const current = d[perm] ?? (selected?.permissions?.[perm] === true);
            return { ...d, [perm]: !current };
          })
        }
        saving={savingPerms}
        onClose={() => setSelected(null)}
        onSave={savePermissions}
      />

      <AdminConfirmDialog
        visible={!!suspendTarget}
        title={suspendTarget?.isSuspended ? "Unsuspend administrator?" : "Suspend administrator?"}
        message={
          suspendTarget?.isSuspended
            ? `${suspendTarget?.name} will regain API access immediately.`
            : `${suspendTarget?.name} will immediately lose all admin API access.`
        }
        confirmLabel={suspendTarget?.isSuspended ? "Unsuspend" : "Suspend"}
        danger={!suspendTarget?.isSuspended}
        onConfirm={toggleSuspend}
        onCancel={() => setSuspendTarget(null)}
      />
    </View>
  );
}

function AdminPermissionEditor(props: any) {
  const { visible, admin, catalog, permDraft, togglePerm,
    typeDraft, setTypeDraft, saving, onSave, onClose } = props;
  const groups = catalog?.groups || [];
  const adminTypes = catalog?.adminTypes || [];
  return (
    <AdminModal visible={visible} onClose={onClose}>
      <Text style={styles.sectionTitle}>Administrator</Text>
      <Text style={styles.adminName}>{admin?.name}</Text>
      <Text style={styles.adminEmail}>{admin?.email}</Text>

      <Text style={styles.sectionTitle}>Role</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {adminTypes.map((t: string) => (
            <TouchableOpacity key={t}
              style={[styles.filterChip, typeDraft === t && styles.filterChipActive]}
              onPress={() => setTypeDraft(t)}>
              <Text style={[styles.filterChipText, typeDraft === t && styles.filterChipTextActive]}>
                {t.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView style={{ maxHeight: 420 }}>
        {groups.map((g: any) => (
          <View key={g.key} style={{ marginBottom: 14 }}>
            <Text style={styles.groupTitle}>{g.label}</Text>
            {g.permissions.map((perm: string) => {
              const checked = permDraft[perm] ?? admin?.permissions?.[perm] === true;
              return (
                <View key={perm} style={styles.permRow}>
                  <Switch
                    value={checked}
                    onValueChange={() => togglePerm(perm)}
                    trackColor={{ false: "#334155", true: "#B58D3D" }}
                    thumbColor="#F8FAFC"
                    style={{ transform: [{ scale: 0.8 }] }}
                  />
                  <Text style={styles.permLabel}>{perm}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={onSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#0B0B0B" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>
    </AdminModal>
  );
}

function AdminModal({ visible, children, onClose }: any) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>{children}</View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  noAccess: { color: "#94A3B8", fontWeight: "700", textAlign: "center" },
  filterRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: "rgba(148,163,184,0.3)",
  },
  filterChipActive: { borderColor: "#B58D3D", backgroundColor: "rgba(181,141,61,0.15)" },
  filterChipText: { color: "#94A3B8", fontSize: 12, fontWeight: "700" },
  filterChipTextActive: { color: "#B58D3D" },
  card: {
    backgroundColor: "rgba(18,18,20,0.6)", borderRadius: 14, borderWidth: 1,
    borderColor: "rgba(181,141,61,0.15)", padding: 14,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  adminName: { color: "#F8FAFC", fontSize: 15, fontWeight: "800" },
  adminEmail: { color: "#94A3B8", fontSize: 13, fontWeight: "600", marginTop: 2 },
  adminMeta: { color: "#64748B", fontSize: 11, fontWeight: "600", marginTop: 4 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(148,163,184,0.25)", alignSelf: "flex-start",
  },
  chipText: { fontSize: 12, fontWeight: "800" },
  error: { color: "#EF4444", fontWeight: "700", paddingHorizontal: 16, marginTop: 8 },
  empty: { color: "#64748B", fontWeight: "700", textAlign: "center", marginTop: 20 },
  groupTitle: { color: "#B58D3D", fontSize: 12, fontWeight: "900", textTransform: "uppercase", marginBottom: 4 },
  permRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  permLabel: { color: "#CBD5E1", fontSize: 12, fontWeight: "600", flex: 1 },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#121214", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderColor: "rgba(181,141,61,0.25)", padding: 18, maxHeight: "90%",
  },
  sectionTitle: {
    color: "#B58D3D", fontSize: 12, fontWeight: "900", textTransform: "uppercase",
    letterSpacing: 0.5, marginBottom: 6, marginTop: 4,
  },
  btn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12 },
  cancelBtn: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(148,163,184,0.25)" },
  cancelBtnText: { color: "#94A3B8", fontWeight: "800" },
  saveBtn: { backgroundColor: "#B58D3D" },
  saveBtnText: { color: "#0B0B0B", fontWeight: "900" },
});
