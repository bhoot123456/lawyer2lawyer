import React, { useCallback, useEffect, useState } from "react";
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

      {/* HMJ Justice Name */}
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Ionicons name="person-outline" size={18} color="#B58D3D" />
        </View>
        <View style={styles.cardField}>
          <Text style={styles.cardFieldLabel}>HMJ</Text>
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

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={48} color="#B58D3D" />
      <Text style={styles.emptyStateTitle}>No judges available.</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

export default function RegularCourtScreen() {
  const { courtId, courtName } = useLocalSearchParams<{
    courtId: string;
    courtName: string;
  }>();

  const { showToast, toast } = useToast();

  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courtId) {
      return;
    }

    let cancelled = false;
    // Avoid calling setState synchronously inside effect to prevent cascading renders.
    // Schedule state updates asynchronously.
    Promise.resolve().then(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });

    getJudgesByCourt(courtId)
      .then((res) => {
        if (!cancelled && res?.success && res?.data?.judges) {
          setJudges(res.data.judges);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to fetch judges:", err);
          setError("Could not load judges. Check your connection.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courtId]);

  const handleCopyMeetingId = useCallback(
    async (meetingId: string) => {
      try {
        await Clipboard.setStringAsync(meetingId);
        showToast("Meeting ID copied");
      } catch {
        Alert.alert("Error", "Failed to copy Meeting ID");
      }
    },
    [showToast]
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
    [handleCopyMeetingId, handleOpenVCLink, handleSendEmail]
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
              <Ionicons name="business-outline" size={20} color="#D4AF37" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Regular Court</Text>
              <Text style={styles.headerSubtitle}>{courtName || ""}</Text>
            </View>
          </View>
        </View>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Judges Directory</Text>
          <Text style={styles.sectionCount}>
            {judges.length} judge{judges.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
    ),
    [courtName, judges.length]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={judges}
        renderItem={renderJudgeCard}
        keyExtractor={keyExtractor}
        extraData={judges}
        initialNumToRender={judges.length || 10}
        maxToRenderPerBatch={judges.length || 10}
        windowSize={5}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={judges.length === 0 ? EmptyState : null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

