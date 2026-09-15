import React, { useCallback, useEffect, useState } from "react";
import { colors } from "@/theme/designSystem";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLawyerProfile, getLawyerCases, decodeJwtPayload } from "../services/courtdeskApi";

const NAVY_BG = colors.bg.primary;
const NAVY_CARD_BG = "#101D31";
const GOLD = colors.accent.gold;
const TEXT_LIGHT = "#F2F5F9";
const TEXT_MUTED = "#93A3BC";
const TOKEN_KEY = "authToken";
const REFRESH_KEY = "refreshToken";

const caseState = (c: Record<string, any>) => ({
  id: String(c._id || c.id || ""),
  caseNumber: c.caseNumber || "—",
  client: c.client || "—",
  court: c.court || "",
  practiceArea: c.practiceArea || "General",
  status: c.status || "Open",
  priority: c.priority || "—",
});

/**
 * Phase 1 placeholder — Lawyer CourtDesk.
 *
 * Backend-authoritative access control lives on /api/courtdesk
 * (lawyerAuth middleware). This screen additionally guards at the screen
 * level so a non-lawyer (or stale session) landing here is sent to the
 * lawyer login without leaking data.
 */
export default function CourtDeskScreen() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [profileName, setProfileName] = useState("");
  const [cases, setCases] = useState<ReturnType<typeof caseState>[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const guardRole = useCallback(async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const payload = decodeJwtPayload(token);
    if (!token || payload?.role !== "lawyer") {
      router.replace("/lawyer-login");
      return false;
    }
    return true;
  }, [router]);

  const load = useCallback(
    async (spinner = false) => {
      try {
        if (spinner) setRefreshing(true);
        const ok = await guardRole();
        if (!ok) return;
        const [prof, list] = await Promise.all([getLawyerProfile(), getLawyerCases({ limit: 50 })]);
        setProfileName(prof.user?.fullName || prof.user?.email || "Lawyer");
        setCases((list.cases || []).map(caseState));
        setTotal(list.total || 0);
        setError(null);
      } catch (e: any) {
        if (e?.response?.status === 401) {
          router.replace("/lawyer-login");
          return;
        }
        setError(e?.response?.data?.message || e?.message || "Unable to load CourtDesk");
      } finally {
        setBooting(false);
        setRefreshing(false);
      }
    },
    [guardRole, router],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      load(true);
    });
    return () => cancelAnimationFrame(id);
  }, [load]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
    } catch {
      // ignore storage failures; still navigate away
    }
    router.replace("/lawyer-login");
  }, [router]);

  if (booting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={GOLD} size="large" />
        <Text style={styles.muted}>Loading CourtDesk…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={GOLD} />
      }
    >
      <Text style={styles.eyebrow}>LAWYER · COURTDESK</Text>
      <Text style={styles.title}>{profileName}</Text>
      <Text style={styles.subtitle}>Assigned matters</Text>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{total}</Text>
        <Text style={styles.statLabel}>Cases assigned to you</Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {cases.length === 0 && !error ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No assigned cases yet</Text>
          <Text style={styles.muted}>
            Cases assigned to you will appear here. This is the Phase 1 placeholder surface.
          </Text>
        </View>
      ) : (
        cases.map((c) => (
          <View key={c.id} style={styles.caseCard}>
            <Text style={styles.caseNumber}>{c.caseNumber}</Text>
            <Text style={styles.caseClient}>{c.client}</Text>
            <Text style={styles.muted}>
              {c.court} · {c.practiceArea}
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{c.status}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: "#22304A" }]}>
                <Text style={styles.badgeText}>{c.priority}</Text>
              </View>
            </View>
          </View>
        ))
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Phase 1 placeholder — case detail, timelines & editing land in a later phase.
        </Text>
        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NAVY_BG },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NAVY_BG,
    gap: 12,
  },
  content: { padding: 20, paddingBottom: 48 },
  eyebrow: { color: GOLD, fontSize: 12, letterSpacing: 2, fontWeight: "700", marginBottom: 6 },
  title: { color: TEXT_LIGHT, fontSize: 26, fontWeight: "800" },
  subtitle: { color: TEXT_MUTED, fontSize: 14, marginTop: 2, marginBottom: 16 },
  statCard: { backgroundColor: NAVY_CARD_BG, borderRadius: 14, padding: 18, marginBottom: 16 },
  statNumber: { color: GOLD, fontSize: 32, fontWeight: "800" },
  statLabel: { color: TEXT_MUTED, fontSize: 13 },
  caseCard: {
    backgroundColor: NAVY_CARD_BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1D2B44",
  },
  caseNumber: { color: GOLD, fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  caseClient: { color: TEXT_LIGHT, fontSize: 16, fontWeight: "700", marginTop: 2 },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  badge: {
    backgroundColor: "rgba(201,162,39,0.16)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: GOLD, fontSize: 12, fontWeight: "600" },
  emptyBox: {
    backgroundColor: NAVY_CARD_BG,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1D2B44",
  },
  emptyTitle: { color: TEXT_LIGHT, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  error: { color: "#F0A3A3", marginVertical: 10 },
  muted: { color: TEXT_MUTED, fontSize: 13 },
  footer: { marginTop: 24, alignItems: "center", gap: 12 },
  footerText: { color: TEXT_MUTED, fontSize: 12, textAlign: "center" },
  logoutBtn: {
    borderWidth: 1,
    borderColor: "#2A3B5C",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  logoutText: { color: TEXT_LIGHT, fontSize: 12, fontWeight: "600" },
});