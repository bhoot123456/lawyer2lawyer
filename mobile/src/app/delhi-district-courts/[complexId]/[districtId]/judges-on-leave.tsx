import React, { memo, useCallback, useMemo, useState } from "react";
import { colors } from "@/theme/designSystem";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { blurActiveElement } from "@/utils/blurActiveElement";
import {
  getComplexById,
  getDistrictById,
} from "@/data/delhiDistrictCourts";
import { getJudgesOnLeave } from "@/services/judgeDirectoryApi";
import JudgeCard from "@/components/judge/JudgeCard";
import type { JudgeOnLeave } from "@/types/judgeDirectory";

// ─────────────────────────────────────────────────────────
// Constants (matching existing design language)
// ─────────────────────────────────────────────────────────

const ACCENT = colors.accent.gold;
const ACCENT_DARK = "#D4AF37";
const BG_COLOR = "#FAF9F6";
const SURFACE_COLOR = "#FFFFFF";
const BORDER_COLOR = "#EAE5DB";
const TEXT_PRIMARY = "#1E293B";
const TEXT_MUTED = "#64748B";

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────

const Header = memo(function Header({
  districtMeta,
}: {
  districtMeta: { district: string; complex: string; total: number };
}) {
  return (
    <View style={styles.headerContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
        ]}
        onPress={() => {
          blurActiveElement();
          router.back();
        }}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={22} color={ACCENT} />
      </Pressable>
      <View style={styles.headerContent}>
        <View style={styles.headerIconWrap}>
          <Ionicons name="umbrella-outline" size={22} color={ACCENT_DARK} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Judges on Leave</Text>
          <Text style={styles.headerSubtitle}>
            {districtMeta.complex || "District Court"}
          </Text>
        </View>
      </View>
    </View>
  );
});

const LoadingState = memo(function LoadingState() {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={ACCENT} />
      <Text style={styles.loadingText}>Checking judges on leave...</Text>
    </View>
  );
});

const ErrorState = memo(function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.centerContainer}>
      <View style={styles.errorIconWrap}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      </View>
      <Text style={styles.errorTitle}>Unable to Load Data</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.retryButton,
          pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
        ]}
        onPress={onRetry}
      >
        <Ionicons name="refresh-outline" size={18} color={ACCENT} />
        <Text style={styles.retryText}>Try Again</Text>
      </Pressable>
    </View>
  );
});

const PremiumEmptyState = memo(function PremiumEmptyState() {
  return (
    <View style={styles.centerContainer}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="checkmark-circle-outline" size={64} color="#22C55E" />
      </View>
      <Text style={styles.emptyTitle}>No Judges Currently On Leave</Text>
      <Text style={styles.emptyMessage}>
        All judges are currently available for court proceedings in this
        district.
      </Text>
      <View style={styles.emptyDivider} />
      <View style={styles.emptyHintRow}>
        <Ionicons name="information-circle-outline" size={16} color={ACCENT} />
        <Text style={styles.emptyHintText}>
          This information is updated regularly. Check back later for any
          changes.
        </Text>
      </View>
    </View>
  );
});

const ListHeader = memo(function ListHeader({
  districtMeta,
}: {
  districtMeta: { district: string; complex: string; total: number };
}) {
  return (
    <View style={styles.introBlock}>
      <View style={styles.introIconRow}>
        <View style={styles.introIconWrap}>
          <Ionicons name="umbrella-outline" size={24} color={ACCENT_DARK} />
        </View>
        <View style={styles.introIconTextWrap}>
          <Text style={styles.introTitle}>
            {districtMeta.district || "District"}
          </Text>
          <Text style={styles.introCourt}>{districtMeta.complex}</Text>
        </View>
      </View>
      <View style={styles.introDivider} />
      <View style={styles.introStatsRow}>
        <Ionicons name="people-outline" size={16} color={ACCENT} />
        <Text style={styles.introText}>
          {districtMeta.total} Judge{districtMeta.total !== 1 ? "s" : ""} on
          Leave
        </Text>
      </View>
    </View>
  );
});

const InfoFooter = memo(function InfoFooter() {
  return (
    <View style={styles.footerHint}>
      <Ionicons name="information-circle-outline" size={16} color={ACCENT} />
      <Text style={styles.footerHintText}>
        Information is indicative—always verify leave details from the official
        district court website or registry.
      </Text>
    </View>
  );
});

// ─────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────

export default function JudgesOnLeaveScreen() {
  const { complexId, districtId } = useLocalSearchParams<{
    complexId: string;
    districtId: string;
  }>();

  const [judges, setJudges] = useState<JudgeOnLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [directoryMeta, setDirectoryMeta] = useState({
    district: "",
    complex: "",
    total: 0,
  });

  const district = useMemo(
    () => getDistrictById(complexId ?? "", districtId ?? ""),
    [complexId, districtId],
  );

  const complex = useMemo(
    () => getComplexById(complexId ?? ""),
    [complexId],
  );

  const fetchJudgesOnLeave = useCallback(
    async (isRefresh = false) => {
      if (!complexId || !districtId) {
        setError("Invalid court selection");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await getJudgesOnLeave(complexId, districtId);

        if (response.success) {
          setJudges(response.judges);
          setDirectoryMeta({
            district: response.district || district?.title || "",
            complex: response.complex || complex?.title || "",
            total: response.total ?? 0,
          });
        } else {
          setError("Failed to load judges on leave");
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred";
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [complexId, districtId, district, complex],
  );

  useFocusEffect(
    useCallback(() => {
      fetchJudgesOnLeave();
    }, [fetchJudgesOnLeave]),
  );

  const handleRefresh = useCallback(() => {
    fetchJudgesOnLeave(true);
  }, [fetchJudgesOnLeave]);

  const handleRetry = useCallback(() => {
    fetchJudgesOnLeave();
  }, [fetchJudgesOnLeave]);

  const renderJudgeItem = useCallback(
    ({ item }: { item: JudgeOnLeave }) => <JudgeCard judge={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: JudgeOnLeave) => item._id,
    [],
  );

  const listHeader = useMemo(
    () => <ListHeader districtMeta={directoryMeta} />,
    [directoryMeta],
  );

  const headerComponent = useMemo(
    () => (
      <>
        <Header districtMeta={directoryMeta} />
        {listHeader}
        <Text style={styles.sectionLabel}>Judges on Leave</Text>
      </>
    ),
    [directoryMeta, listHeader],
  );

  const listFooter = useMemo(() => <InfoFooter />, []);

  // Fallback for invalid params
  if (!district || !complex) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
            onPress={() => {
              blurActiveElement();
              router.back();
            }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color={ACCENT} />
          </Pressable>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>District Not Found</Text>
          <Text style={styles.errorMessage}>
            Please go back and select a valid district.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={judges}
        renderItem={renderJudgeItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={handleRetry} />
          ) : (
            <PremiumEmptyState />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={ACCENT}
            colors={[ACCENT]}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Styles (matching existing design language)
// ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
  },
  separator: {
    height: 12,
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  // Intro
  introBlock: {
    backgroundColor: SURFACE_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  introIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  introIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  introIconTextWrap: {
    flex: 1,
    gap: 2,
  },
  introTitle: {
    color: ACCENT_DARK,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  introCourt: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "700",
  },
  introDivider: {
    height: 1,
    backgroundColor: BORDER_COLOR,
    marginVertical: 10,
  },
  introStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  introText: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  // Section label
  sectionLabel: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  // Center states
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },

  // Error
  errorIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    color: "#EF4444",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  errorMessage: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: "800",
  },

  // Premium Empty State
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  emptyTitle: {
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyMessage: {
    color: TEXT_MUTED,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyDivider: {
    height: 1,
    backgroundColor: BORDER_COLOR,
    width: "60%",
    marginBottom: 16,
  },
  emptyHintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.accent.goldSubtle,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
  },
  emptyHintText: {
    color: ACCENT,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    flex: 1,
  },

  // Footer
  footerHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    marginTop: 20,
  },
  footerHintText: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    flex: 1,
  },
});

