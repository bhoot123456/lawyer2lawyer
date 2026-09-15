import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  AIInsightsCard,
  CauseListCard,
  CourtHolidayCard,
  DashboardEmptyState,
  DashboardErrorState,
  DashboardHeader,
  DashboardLoadingState,
  DashboardStats,
  LegalNewsCard,
  PendingClientCalls,
  PendingDrafts,
  QuickActionsGrid,
  RecentActivityCard,
  RecentNotifications,
  TodayHearings,
  TodayTimeline,
  UpcomingHearings,
  NextHearingCard,
} from "@/components/dashboard";

import type { AdvocateProfile, DashboardData } from "@/components/dashboard/types";
import { getDashboardData } from "@/services/dashboardApi";

import { useFocusEffect } from "expo-router";
import { normalizeApiError } from "@/services/api";

import { spacing } from "@/theme/designSystem";

export default function DashboardRoute() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchDashboard = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await getDashboardData();
      setData(res);
    } catch (e: any) {
      setError(normalizeApiError(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );



  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDashboard();
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboard]);

  const profile: AdvocateProfile | undefined = data?.profile;

  const content = useMemo(() => {
    if (loading && !data) return <DashboardLoadingState />;

    if (error && !data) {
      return (
        <DashboardErrorState
          message={error}
          onRetry={() => {
            fetchDashboard();
          }}
        />
      );
    }

    if (!data) {
      return (
        <DashboardEmptyState
          title="Dashboard is empty"
          subtitle="No dashboard data found"
          onAction={() => {
            fetchDashboard();
          }}
          actionLabel="Refresh"
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <DashboardHeader profile={profile as AdvocateProfile} />
        </View>

        {/* Priority order: Next Hearing → Today's Hearings → Stats — the first
            thing a lawyer sees each morning should feel considered. */}
        <View style={styles.section}>
          <NextHearingCard
            hearings={[...(data.todayHearings || []), ...(data.upcomingHearings || [])]}
            loading={loading}
          />
        </View>

        <View style={styles.section}>
          <TodayHearings hearings={data.todayHearings} loading={loading} />
        </View>

        <View style={styles.section}>
          <DashboardStats
            stats={{
              todayHearings: data.todayHearings.length,
              activeCases: data.activeCases ?? 0,
              pendingCases: data.pendingCases ?? 0,
              revenueToday: data.todayRevenue,
              clientMeetings: data.clientMeetings,
              pendingDrafts: data.pendingDrafts.length,
            }}
            loading={loading}
          />
        </View>

        <View style={styles.section}>
          <QuickActionsGrid />
        </View>

        <View style={styles.section}>
          <TodayTimeline
            items={
              data.todayHearings.map((h) => ({
                id: h.id,
                title: h.caseTitle || h.caseNumber,
                time: h.hearingTime,
                type: "hearing",
              })) as any
            }
          />
        </View>

        <View style={styles.section}>
          <UpcomingHearings hearings={data.upcomingHearings} loading={loading} />
        </View>


        <View style={styles.section}>
          <PendingDrafts drafts={data.pendingDrafts} loading={loading} error={null} />
        </View>

        <View style={styles.section}>
          <PendingClientCalls calls={data.pendingClientCalls} loading={loading} error={null} />
        </View>

        <View style={styles.section}>
          <RecentNotifications notifications={data.recentNotifications} loading={loading} />
        </View>

        <View style={styles.section}>
          <CourtHolidayCard holidays={data.courtHolidays} loading={loading} />
        </View>

        <View style={styles.section}>
          <CauseListCard entries={data.causeList} loading={loading} />
        </View>

        <View style={styles.section}>
          <AIInsightsCard insights={data.aiInsights} loading={loading} />
        </View>

        <View style={styles.section}>
          <LegalNewsCard news={data.legalNews} loading={loading} />
        </View>

        <View style={styles.section}>
          <RecentActivityCard activities={data.recentActivity} loading={loading} />
        </View>
      </ScrollView>
    );
  }, [
    data,
    error,
    fetchDashboard,
    loading,
    onRefresh,
    profile,
    refreshing,
  ]);

  return content;
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.md,
    paddingBottom: 120,
  },
  section: {
    gap: spacing.sm,
  },
});