import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { blurActiveElement } from "@/utils/blurActiveElement";
import { getJudgesByCourt } from "@/services/judgeDirectoryApi";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Judge = {
  _id: string;
  courtRoom: string;
  judgeName: string;
  vcLink: string;
  meetingId: string;
  email: string;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const REGISTRAR_COURT_ID = "delhi-high-court-registrar";
const REGISTRAR_COURT_NAME = "Delhi High Court Registrar";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function useToast() {
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const toastTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => {
      setToastVisible(false);
    }, 2000);
  }, []);

  const toast = toastVisible ? (
    <View style={styles.toast}>
      <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
      <Text style={styles.toastText}>{toastMessage}</Text>
    </View>
  ) : null;

  return { showToast, toast };
}

/* ------------------------------------------------------------------ */
/*  Judge Card                                                         */
/* ------------------------------------------------------------------ */

function JudgeCard({
  judge,
  onCopyMeetingId,
  onOpenVCLink,
  onSendEmail,
}: {
  judge: Judge;
  onCopyMeetingId: (meetingId: string) => void;
  onOpenVCLink: (url: string) => void;
  onSendEmail: (email: string) => void;
}) {
  return (
    <View style={styles.judgeCard}>
      {/* Court Room */}
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Ionicons name="business-outline" size={18} color="#B58D3D" />
        </View>
        <View style={styles.cardField}>
          <Text style={styles.cardFieldLabel}>Court Room</Text>
          <Text style={styles.cardFieldValue}>{judge.courtRoom}</Text>
        </View>
      </View>

      {/* Registrar Name */}
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Ionicons name="person-outline" size={18} color="#B58D3D" />
        </View>
        <View style={styles.cardField}>
          <Text style={styles.cardFieldLabel}>Registrar</Text>
          <Text style={styles.cardFieldValue}>{judge.judgeName}</Text>
        </View>
      </View>

      {/* VC Link */}
      <Pressable
        onPress={() => onOpenVCLink(judge.vcLink)}
        style={({ pressed }) => [
          styles.cardRow,
          pressed ? { opacity: 0.7 } : undefined,
        ]}
      >
        <View style={styles.iconBox}>
          <Ionicons name="videocam-outline" size={18} color="#B58D3D" />
        </View>
        <View style={styles.cardField}>
          <Text style={styles.cardFieldLabel}>VC Link</Text>
          <Text style={styles.linkValue}>Join VC</Text>
        </View>
        <Ionicons name="open-outline" size={16} color="#B58D3D" />
      </Pressable>

      {/* Meeting ID */}
      <Pressable
        onPress={() => onCopyMeetingId(judge.meetingId)}
        style={({ pressed }) => [
          styles.cardRow,
          pressed ? { opacity: 0.7 } : undefined,
        ]}
      >
        <View style={styles.iconBox}>
          <Ionicons name="key-outline" size={18} color="#B58D3D" />
        </View>
        <View style={styles.cardField}>
          <Text style={styles.cardFieldLabel}>Meeting ID</Text>
          <Text style={styles.cardFieldValue}>{judge.meetingId}</Text>
        </View>
        <Ionicons name="copy-outline" size={16} color="#B58D3D" />
      </Pressable>

      {/* Email */}
      <Pressable
        onPress={() => onSendEmail(judge.email)}
        style={({ pressed }) => [
          styles.cardRow,
          pressed ? { opacity: 0.7 } : undefined,
        ]}
      >
        <View style={styles.iconBox}>
          <Ionicons name="mail-outline" size={18} color="#B58D3D" />
        </View>
        <View style={styles.cardField}>
          <Text style={styles.cardFieldLabel}>Email</Text>
          <Text style={styles.linkValue} numberOfLines={1}>
            {judge.email}
          </Text>
        </View>
        <Ionicons name="open-outline" size={16} color="#B58D3D" />
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({ search }: { search?: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={48} color="#B58D3D" />
      <Text style={styles.emptyStateTitle}>
        {search
          ? "No registrars match your search."
          : "No registrars available."}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

export default function RegistrarCourtScreen() {
  const { courtName } = useLocalSearchParams<{ courtName?: string }>();

  const { showToast, toast } = useToast();

  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Derive filtered judges using useMemo to avoid cascading renders
  const filteredJudges = useMemo(() => {
    if (!search.trim()) {
      return judges;
    }
    const q = search.trim().toLowerCase();
    return judges.filter(
      (j) =>
        j.judgeName.toLowerCase().includes(q) ||
        j.courtRoom.toLowerCase().includes(q) ||
        j.email.toLowerCase().includes(q),
    );
  }, [search, judges]);

  // Fetch judges
  const fetchJudges = useCallback(async () => {
    try {
      setError(null);
      const res = await getJudgesByCourt(REGISTRAR_COURT_ID);
      if (res?.success && res?.data?.judges) {
        setJudges(res.data.judges);
        return res.data.judges;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch registrar court judges:", err);
      setError("Could not load registrars. Check your connection.");
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(async () => {
      if (!cancelled) {
        setLoading(true);
        await fetchJudges();
        if (!cancelled) {
          setLoading(false);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchJudges]);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJudges();
    setRefreshing(false);
  }, [fetchJudges]);

  const handleCopyMeetingId = useCallback(
    async (meetingId: string) => {
      try {
        await Clipboard.setStringAsync(meetingId);
        showToast("Meeting ID copied");
      } catch {
        Alert.alert("Error", "Failed to copy Meeting ID");
      }
    },
    [showToast],
  );

  const handleOpenVCLink = useCallback((url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  }, []);

  const handleSendEmail = useCallback((email: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  }, []);

  const renderJudgeCard = useCallback(
    ({ item }: { item: Judge }) => (
      <JudgeCard
        judge={item}
        onCopyMeetingId={handleCopyMeetingId}
        onOpenVCLink={handleOpenVCLink}
        onSendEmail={handleSendEmail}
      />
    ),
    [handleCopyMeetingId, handleOpenVCLink, handleSendEmail],
  );

  const keyExtractor = useCallback((item: Judge) => item._id, []);

  const renderHeader = useCallback(
    () => (
      <View>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed ? { opacity: 0.7 } : undefined,
            ]}
            onPress={() => {
              blurActiveElement();
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/delhi-courts");
              }
            }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          </Pressable>
          <View style={styles.headerContent}>
            <View style={styles.headerIconBox}>
              <Ionicons name="journal-outline" size={20} color="#D4AF37" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Registrar Court</Text>
              <Text style={styles.headerSubtitle}>
                {courtName || REGISTRAR_COURT_NAME}
              </Text>
            </View>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, room or email..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
                style={({ pressed }) => [
                  styles.searchClear,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Registrars Directory</Text>
          <Text style={styles.sectionCount}>
            {filteredJudges.length} registrar
            {filteredJudges.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
    ),
    [courtName, search, filteredJudges.length],
  );

  // Loading state
  if (loading && judges.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B58D3D" />
          <Text style={styles.loadingText}>Loading registrars...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && judges.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed ? { opacity: 0.7 } : undefined,
            ]}
            onPress={() => {
              blurActiveElement();
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/delhi-courts");
              }
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#D4AF37" />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={async () => {
              setLoading(true);
              setError(null);
              await fetchJudges();
              setLoading(false);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredJudges}
        renderItem={renderJudgeCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState search={search} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#B58D3D"
            colors={["#B58D3D"]}
          />
        }
      />
      {toast}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },

  /* Header */
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingTop: Platform.OS === "ios" ? 8 : 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(181, 141, 61, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(181, 141, 61, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#1E293B",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  /* Search bar */
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "#EAE5DB",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "600",
    padding: 0,
  },
  searchClear: {
    padding: 4,
  },

  /* Section header */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    color: "#B58D3D",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  sectionCount: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },

  /* Judge card */
  judgeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EAE5DB",
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(181,141,61,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardField: {
    flex: 1,
  },
  cardFieldLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  cardFieldValue: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 1,
  },
  linkValue: {
    color: "#B58D3D",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 1,
    textDecorationLine: "underline",
  },

  /* Empty state */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateTitle: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },

  /* Loading state */
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
  },

  /* Error state */
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(181, 141, 61, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.3)",
  },
  retryButtonText: {
    color: "#B58D3D",
    fontSize: 13,
    fontWeight: "800",
  },

  /* Toast */
  toast: {
    position: "absolute",
    bottom: 130,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toastText: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
});

