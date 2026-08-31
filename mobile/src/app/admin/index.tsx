import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAdminDashboard, getCmsModules } from "@/services/adminApi";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import GlassCard from "@/components/ui/GlassCard";

const CATEGORY_LABELS: Record<string, string> = {
  legal_data: "Legal Data",
  content: "Content",
  police: "Police Administration",
  court_info: "Court Information",
  users: "User Management",
};

const CATEGORY_ICONS: Record<string, string> = {
  legal_data: "scale-outline",
  content: "documents-outline",
  police: "shield-outline",
  court_info: "calendar-outline",
  users: "people-outline",
};

interface DashboardData {
  totalUsers: number;
  totalLawyers: number;
  totalClients: number;
  totalCases: number;
  totalArticles: number;
  totalTribunals: number;
  pendingVerifications: number;
  activeLawyers: number;
  suspendedUsers: number;
  publishedArticles: number;
  recentLawyers: any[];
  recentClients: any[];
  recentCases: any[];
  casesByStatus: { _id: string; count: number }[];
}

const QUICK_ACTIONS = [
  {
    label: "Manage Lawyers",
    icon: "people-outline" as const,
    route: "/admin/lawyers",
    color: "#3B82F6",
  },
  {
    label: "Manage Clients",
    icon: "person-outline" as const,
    route: "/admin/clients",
    color: "#10B981",
  },
  {
    label: "Manage Cases",
    icon: "briefcase-outline" as const,
    route: "/admin/cases",
    color: "#F59E0B",
  },
  {
    label: "Manage Articles",
    icon: "newspaper-outline" as const,
    route: "/admin/articles",
    color: "#8B5CF6",
  },
];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const { has, profile } = useAdminPermissions();
  const [cmsModules, setCmsModules] = useState<any[]>([]);

  // Permission-aware CMS module grid: only modules the admin can VIEW.
  const cmsByCategory = React.useMemo(() => {
    const visible = cmsModules.filter((m) => has(`${m.permissionKey}.view`));
    const grouped = new Map<string, any[]>();
    for (const m of visible) {
      if (!grouped.has(m.category)) grouped.set(m.category, []);
      grouped.get(m.category)!.push(m);
    }
    return Array.from(grouped.entries());
  }, [cmsModules, has]);

  useEffect(() => {
    getCmsModules().then(setCmsModules).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setError("");
      const res = await getAdminDashboard();
      if (res?.success && res?.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error("Admin dashboard error:", err);
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Admin Panel" subtitle="Loading..." />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#B58D3D" />
        </View>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Admin Panel" showBack />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Admin Panel"
        subtitle="Manage your legal platform"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B58D3D" />}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={data?.totalUsers || 0}
            icon="people-outline"
            color="#3B82F6"
          />
          <StatCard
            title="Lawyers"
            value={data?.totalLawyers || 0}
            icon="briefcase-outline"
            color="#10B981"
          />
          <StatCard
            title="Clients"
            value={data?.totalClients || 0}
            icon="person-outline"
            color="#8B5CF6"
          />
          <StatCard
            title="Cases"
            value={data?.totalCases || 0}
            icon="folder-open-outline"
            color="#F59E0B"
          />
          <StatCard
            title="Articles"
            value={data?.totalArticles || 0}
            icon="newspaper-outline"
            color="#EC4899"
          />
          <StatCard
            title="Pending Verifications"
            value={data?.pendingVerifications || 0}
            icon="shield-checkmark-outline"
            color={data?.pendingVerifications ? "#EF4444" : "#10B981"}
            subtitle={data?.pendingVerifications ? "Requires attention" : "All clear"}
          />
          <StatCard
            title="Active Lawyers"
            value={data?.activeLawyers || 0}
            icon="checkmark-circle-outline"
            color="#10B981"
          />
          <StatCard
            title="Tribunals"
            value={data?.totalTribunals || 0}
            icon="business-outline"
            color="#6366F1"
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionCard, { borderColor: `${action.color}30` }]}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Ionicons name="chevron-forward-outline" size={18} color="#64748B" />
            </TouchableOpacity>
          ))}
          {has("admin_users.view") && (
            <TouchableOpacity
              style={[styles.actionCard, { borderColor: "#B58D3D30" }]}
              onPress={() => router.push("/admin/admin-users" as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#B58D3D15" }]}>
                <Ionicons name="shield-outline" size={24} color="#B58D3D" />
              </View>
              <Text style={styles.actionLabel}>Admin Users</Text>
              <Ionicons name="chevron-forward-outline" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
          {(profile?.isSuperAdmin || has("audit_logs.view")) && (
            <TouchableOpacity
              style={[styles.actionCard, { borderColor: "#B58D3D30" }]}
              onPress={() => router.push("/admin/audit-logs" as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#B58D3D15" }]}>
                <Ionicons name="receipt-outline" size={24} color="#B58D3D" />
              </View>
              <Text style={styles.actionLabel}>Audit Logs</Text>
              <Ionicons name="chevron-forward-outline" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content Management (permission-aware CMS modules) */}
        {cmsByCategory.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Content Management</Text>
            {cmsByCategory.map(([category, mods]: any) => (
              <View key={category} style={{ marginBottom: 14 }}>
                <Text style={styles.categoryLabel}>
                  {CATEGORY_LABELS[category] || category}
                </Text>
                <View style={styles.quickActions}>
                  {mods.map((mod: any) => (
                    <TouchableOpacity
                      key={mod.key}
                      style={[styles.actionCard, { borderColor: "rgba(181,141,61,0.25)" }]}
                      onPress={() => router.push(`/admin/cms/${mod.key}` as any)}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: "rgba(181,141,61,0.12)" }]}>
                        <Ionicons
                          name={(CATEGORY_ICONS[category] || "documents-outline") as any}
                          size={22}
                          color="#B58D3D"
                        />
                      </View>
                      <Text style={styles.actionLabel}>{mod.label}</Text>
                      <Ionicons name="chevron-forward-outline" size={16} color="#64748B" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        {/* Cases by Status */}
        {data?.casesByStatus && data.casesByStatus.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Cases by Status</Text>
            <GlassCard>
              {data.casesByStatus.map((item, idx) => (
                <View
                  key={item._id}
                  style={[styles.statusRow, idx < data.casesByStatus.length - 1 && styles.statusRowBorder]}
                >
                  <Text style={styles.statusLabel}>{item._id}</Text>
                  <View style={styles.statusBarWrap}>
                    <View
                      style={[
                        styles.statusBar,
                        {
                          width: `${Math.min((item.count / Math.max(...data.casesByStatus.map((s) => s.count))) * 100, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.statusCount}>{item.count}</Text>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <GlassCard>
          {data?.recentCases && data.recentCases.length > 0 ? (
            data.recentCases.slice(0, 5).map((c: any, idx: number) => (
              <View key={c._id} style={[styles.activityRow, idx < 4 && styles.activityRowBorder]}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{c.caseTitle || c.caseNumber}</Text>
                  <Text style={styles.activityMeta}>
                    {c.status} • {new Date(c.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              <Text
                style={[
                  styles.activityPriority,
                  {
                    color:
                      c.priority === "Urgent" ? "#EF4444" :
                      c.priority === "High" ? "#F59E0B" :
                      c.priority === "Medium" ? "#3B82F6" : "#10B981",
                  },
                ]}
              >
                {c.priority}
              </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="time-outline" size={32} color="#64748B" />
              <Text style={styles.emptyText}>No recent activity</Text>
            </View>
          )}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  categoryLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 18, 20, 0.6)",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flex: 1,
    minWidth: "45%",
    gap: 10,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "800",
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  statusRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(181, 141, 61, 0.1)",
  },
  statusLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
    width: 100,
  },
  statusBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 4,
    overflow: "hidden",
  },
  statusBar: {
    height: "100%",
    backgroundColor: "#B58D3D",
    borderRadius: 4,
  },
  statusCount: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "900",
    width: 40,
    textAlign: "right",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  activityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(181, 141, 61, 0.1)",
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B58D3D",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
  },
  activityMeta: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  activityPriority: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(181, 141, 61, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.3)",
  },
  retryText: {
    color: "#B58D3D",
    fontWeight: "800",
    fontSize: 14,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});
