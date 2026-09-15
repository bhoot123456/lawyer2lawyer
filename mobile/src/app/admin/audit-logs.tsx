import React, { useCallback, useState } from "react";
import { colors } from "@/theme/designSystem";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { getAuditLogs, type AuditLogEntry } from "@/services/adminApi";

const ACTION_COLORS: Record<string, string> = {
  CREATE: colors.semantic.success, UPDATE: colors.semantic.info, DELETE: colors.semantic.danger,
  "case.delete": colors.semantic.danger,
  PUBLISH: colors.semantic.success, UNPUBLISH: colors.semantic.warning, ARCHIVE: colors.text.muted,
  RESTORE: colors.semantic.info, VERIFY: colors.accent.gold,
};

export default function AuditLogsScreen() {
  const { has, loading: permLoading } = useAdminPermissions();
  const canView = has("audit_logs.view");

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!canView) { setLoading(false); return; }
      (async () => {
        try {
          setError("");
          const res = await getAuditLogs({
            ...(moduleFilter ? { module: moduleFilter } : {}),
            ...(actionFilter ? { action: actionFilter } : {}),
            limit: 50,
          });
          if (res?.success) setLogs(res.data.logs || []);
        } catch (e: any) {
          setError(e?.response?.data?.message || "Failed to load audit logs");
        } finally {
          setLoading(false);
        }
      })();
    }, [canView, moduleFilter, actionFilter]),
  );

  if (!permLoading && !canView) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Audit Logs" showBack />
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={44} color="#EF4444" />
          <Text style={styles.noAccess}>You don&apos;t have permission to view audit logs.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader title="Audit Logs" subtitle="Every administrative mutation" showBack />
      <View style={{ padding: 16, paddingBottom: 0, gap: 8 }}>
        <TextInput
          style={styles.input}
          placeholder="Filter by module (e.g. tribunals)"
          placeholderTextColor="#475569"
          value={moduleFilter}
          onChangeText={setModuleFilter}
          autoCapitalize="none"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["", "CREATE", "UPDATE", "DELETE", "case.delete", "PUBLISH", "ARCHIVE", "VERIFY"].map((a) => (
              <TouchableOpacity key={a || "all"}
                style={[styles.chip, actionFilter === a && styles.chipActive]}
                onPress={() => setActionFilter(a)}>
                <Text style={[styles.chipText, actionFilter === a && styles.chipTextActive]}>{a || "All actions"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {error !== "" && <Text style={styles.error}>{error}</Text>}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.accent.gold} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }}>
          {logs.map((log) => {
            const color = ACTION_COLORS[log.action] || "#94A3B8";
            const open = expanded === log._id;
            return (
              <TouchableOpacity key={log._id} style={styles.card}
                onPress={() => setExpanded(open ? null : log._id)}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.action, { color }]}>{log.action}</Text>
                  <Text style={styles.when}>{new Date(log.createdAt).toLocaleString()}</Text>
                </View>
                <Text style={styles.who}>{log.adminName}{log.adminEmail ? ` (${log.adminEmail})` : ""}</Text>
                <Text style={styles.what}>
                  {log.module}{log.recordLabel ? ` • ${log.recordLabel}` : ""}
                </Text>
                {!!log.changedFields?.length && (
                  <Text style={styles.fields}>Changed: {log.changedFields.join(", ")}</Text>
                )}
                {open && (
                  <View style={{ marginTop: 8 }}>
                    {log.before != null && (
                      <Text style={styles.json} numberOfLines={12}>
                        Before: {JSON.stringify(log.before)}
                      </Text>
                    )}
                    {log.after != null && (
                      <Text style={styles.json} numberOfLines={12}>
                        After: {JSON.stringify(log.after)}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          {logs.length === 0 && <Text style={styles.noAccess}>No audit entries found</Text>}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  noAccess: { color: "#94A3B8", fontWeight: "700", textAlign: "center" },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
    borderColor: colors.border.goldLight, borderRadius: 12,
    color: "#F8FAFC", paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, fontWeight: "600",
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: "rgba(148,163,184,0.3)",
  },
  chipActive: { borderColor: colors.accent.gold, backgroundColor: colors.accent.goldLight },
  chipText: { color: "#94A3B8", fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: colors.accent.gold },
  card: {
    backgroundColor: "rgba(18,18,20,0.6)", borderRadius: 14, borderWidth: 1,
    borderColor: colors.accent.goldLight, padding: 14,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  action: { fontSize: 14, fontWeight: "800" },
  when: { color: "#64748B", fontSize: 12, fontWeight: "600" },
  who: { color: "#CBD5E1", fontSize: 12, fontWeight: "700", marginTop: 4 },
  what: { color: "#94A3B8", fontSize: 12, fontWeight: "600", marginTop: 2 },
  fields: { color: "#64748B", fontSize: 12, fontWeight: "600", marginTop: 4 },
  json: { color: "#64748B", fontSize: 12, marginTop: 4 },
  error: { color: "#EF4444", fontWeight: "700", paddingHorizontal: 16, marginTop: 8 },
});
