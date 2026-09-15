import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  Text,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radii } from "@/theme/designSystem";
import { useThemeColors } from "@/theme/ThemeProvider";
import { GlassCard, HomeCard, SkeletonCard, ErrorState } from "@/components/ui";
import {
  getAdvocateProfile,
  getTodayHearings,
  getUpcomingHearings,
  getDashboardStats,
} from "@/services/dashboardApi";
import { normalizeApiError } from "@/services/api";
import { blurActiveElement } from "@/utils/blurActiveElement";
import { HomeHeader, HomeStatCard, HomeNextHearing } from "@/components/home";
import type {
  AdvocateProfile,
  HearingItem,
  DashboardStats,
} from "@/components/dashboard/types";

interface DailyBriefData {
  profile: AdvocateProfile;
  todayHearings: HearingItem[];
  upcomingHearings: HearingItem[];
  stats: DashboardStats;
}

/**
 * Daily CourtDesk — the advocate's home screen.
 */

export default function HomeScreen() {
  const themeColors = useThemeColors();
  const [data, setData] = useState<DailyBriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      const [profile, todayHearings, upcomingHearings, stats] =
        await Promise.all([
          getAdvocateProfile(),
          getTodayHearings(),
          getUpcomingHearings(),
          getDashboardStats(),
        ]);
      setData({ profile, todayHearings, upcomingHearings, stats });
    } catch (e: any) {
      setError(normalizeApiError(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const courtsToday = useMemo(() => {
    const unique = new Set(
      (data?.todayHearings || [])
        .map((h) => h.court)
        .filter((c) => c && c.trim()),
    );
    return unique.size;
  }, [data?.todayHearings]);

  const nextHearingHearings = useMemo(
    () => [...(data?.todayHearings || []), ...(data?.upcomingHearings || [])],
    [data?.todayHearings, data?.upcomingHearings],
  );

  const handleSearchPress = () => {
    blurActiveElement();
    router.push("/search" as any);
  };

  const handleToolPress = (route: string) => {
    blurActiveElement();
    router.push(route as any);
  };

  const courtTools = [
    { title: "Delhi Courts", icon: "business-outline", route: "/delhi-courts" },
    { title: "District Courts", icon: "people-outline", route: "/delhi-district-courts" },
    { title: "Court Diary", icon: "calendar-outline", route: "/court-diary" },
    { title: "Supreme Court", icon: "flag-outline", route: "/supreme-court" },
  ];

  const myPractice = [
    { title: "My Cases", icon: "briefcase-outline", route: "/cases" },
    { title: "New Case", icon: "add-circle-outline", route: "/cases/new" },
    { title: "Drafts", icon: "document-text-outline", route: "/draft-library" },
  ];

  const legalResearch = [
    { title: "Bare Acts", icon: "book-outline", route: "/bare-acts" },
    { title: "Knowledge Hub", icon: "library-outline", route: "/knowledge-hub" },
    { title: "Tribunals", icon: "hammer-outline", route: "/tribunals" },
    { title: "Criminal Law", icon: "shield-outline", route: "/criminal-law" },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  const renderStatCards = () => {
    const hearingsCount = data?.todayHearings?.length ?? 0;
    const activeCases = data?.stats?.activeCases ?? 0;
    return (
      <View style={styles.statsRow}>
        <View style={styles.statWrap}>
          <HomeStatCard
            icon="time-outline"
            value={hearingsCount}
            label="Hearings Today"
          />
        </View>
        <View style={styles.statWrap}>
          <HomeStatCard
            icon="briefcase-outline"
            value={activeCases}
            label="Active Cases"
          />
        </View>
        <View style={styles.statWrap}>
          <HomeStatCard
            icon="business-outline"
            value={courtsToday > 0 ? courtsToday : "—"}
            label="Courts Today"
          />
        </View>
      </View>
    );
  };

  const renderShortcutGrid = (
    items: { title: string; icon: string; route: string }[],
  ) => (
    <View style={styles.shortcutGrid}>
      {items.map((item) => (
        <HomeCard
          key={item.title}
          title={item.title}
          icon={item.icon}
          onPress={() => handleToolPress(item.route)}
        />
      ))}
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <SkeletonCard lines={3} showActions={false} />
      <Text style={styles.loadingFooter}>Loading your court day…</Text>
    </View>
  );

  const renderContent = () => {
    if (loading && !data) return renderLoading();
    if (error && !data)
      return (
        <View style={styles.errorState}>
          <ErrorState message={error} onRetry={fetchData} />
        </View>
      );
    if (!data)
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="scale-outline" size={48} color={colors.accent.gold} />
          <Text style={styles.emptyTitle}>Daily CourtDesk</Text>
          <Text style={styles.emptySubtext}>
            Your court-day briefing will appear here once data is loaded.
          </Text>
        </View>
      );

    return (
      <View style={styles.content}>
        {/* Greeting */}
        <HomeHeader profile={data.profile} />

        {/* Search */}
        <GlassCard
          borderColor={colors.border.goldLight}
          accent={colors.accent.gold}
          elevation={2}
        >
          <Pressable
            style={styles.searchField}
            onPress={handleSearchPress}
            accessibilityRole="button"
            accessibilityLabel="Search cases, courts, judges, Acts"
          >
            <Ionicons name="search-outline" size={20} color={colors.accent.gold} />
            <Text style={styles.searchPlaceholder}>
              Search cases, courts, judges, Acts…
            </Text>
          </Pressable>
        </GlassCard>

        {/* Today at a Glance */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Today at a Glance</Text>
          {renderStatCards()}
        </View>

        {/* Next Hearing */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Next Hearing</Text>
          <HomeNextHearing hearings={nextHearingHearings} loading={loading} />
        </View>

        {/* Court Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Court Tools</Text>
          {renderShortcutGrid(courtTools)}
        </View>

        {/* My Practice */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>My Practice</Text>
          {renderShortcutGrid(myPractice)}
        </View>

        {/* Legal Research */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Legal Research</Text>
          {renderShortcutGrid(legalResearch)}
        </View>

        {/* Legal AI Copilot */}
        <GlassCard
          borderColor={colors.border.goldLight}
          accent={colors.accent.gold}
          elevation={2}
        >
          <View style={styles.aiCopilotCard}>
            <View style={styles.aiCopilotHeader}>
              <Ionicons name="sparkles-outline" size={24} color={colors.accent.gold} />
              <Text style={styles.aiCopilotTitle}>Legal AI Copilot</Text>
            </View>
            <Text style={styles.aiCopilotText}>
              Ask about legal research, drafting, cases or provisions.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.aiCopilotButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => handleToolPress("/ai-assistant")}
              accessibilityRole="button"
              accessibilityLabel="Open AI Assistant"
            >
              <Text style={styles.aiCopilotBtnText}>Open AI Assistant</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.text.inverse} />
            </Pressable>
          </View>
        </GlassCard>
      </View>
    );
  };

  const renderMainScroll = () => (
    <View
      style={[styles.container, { backgroundColor: themeColors.bg.primary }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.gold}
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );

  return renderMainScroll();
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl + 80,
    gap: spacing.lg,
  },
  loadingContainer: { gap: spacing.lg },
  loadingFooter: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  errorState: { marginTop: spacing.xl },
  emptyContainer: {
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    color: colors.text.primary,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    letterSpacing: typography.h2.letterSpacing,
  },
  emptySubtext: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    textAlign: "center",
  },
  content: { gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionLabel: {
    color: colors.accent.goldDark,
    fontSize: typography.overline.fontSize,
    fontWeight: typography.overline.fontWeight,
    letterSpacing: typography.overline.letterSpacing,
    textTransform: "uppercase",
  },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  statWrap: { flex: 1, minWidth: 0 },
  shortcutGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  searchPlaceholder: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    flex: 1,
  },
  aiCopilotCard: { gap: spacing.sm },
  aiCopilotHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  aiCopilotTitle: {
    color: colors.text.primary,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    letterSpacing: typography.h4.letterSpacing,
  },
  aiCopilotText: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: 20,
  },
  aiCopilotButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.accent.gold,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    alignSelf: "flex-start",
  },
  aiCopilotBtnText: {
    color: colors.text.inverse,
    fontWeight: "800",
    fontSize: typography.caption.fontSize,
    letterSpacing: typography.caption.letterSpacing,
  },
});
