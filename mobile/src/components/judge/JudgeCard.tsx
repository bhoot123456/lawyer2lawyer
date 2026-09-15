import React, { memo, useCallback } from "react";
import { colors } from "@/theme/designSystem";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Linking,
  Share,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DistrictCourtJudge } from "@/types/judgeDirectory";

// ─────────────────────────────────────────────────────────
// Constants (matching the Delhi district court design language)
// ─────────────────────────────────────────────────────────

const ACCENT = colors.accent.gold;
const ACCENT_DARK = "#D4AF37";
const BG_COLOR = "#FAF9F6";
const SURFACE_COLOR = "#FFFFFF";
const BORDER_COLOR = "#EAE5DB";
const TEXT_PRIMARY = "#1E293B";
const TEXT_MUTED = "#64748B";

// ─────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────

type JudgeCardProps = {
  readonly judge: DistrictCourtJudge;
};

// ─────────────────────────────────────────────────────────
// JudgeCard Component
// ─────────────────────────────────────────────────────────

const JudgeCard: React.FC<JudgeCardProps> = memo(function JudgeCard({
  judge,
}) {
  /**
   * Join Virtual Court — open the VC link in the browser.
   */
  const handleJoinVC = useCallback(() => {
    if (judge.vcLink) {
      Linking.openURL(judge.vcLink).catch(() => {
        // Silently fail — never crash
      });
    }
  }, [judge.vcLink]);

  /**
   * Open email client with judge's email.
   */
  const handleEmail = useCallback(() => {
    if (judge.email) {
      Linking.openURL(`mailto:${judge.email}`).catch(() => {
        // Silently fail — never crash
      });
    }
  }, [judge.email]);

  /**
   * Share judge details.
   */
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: [
          `\u{1F3DB}\uFE0F ${judge.name}`,
          judge.designation ? `Designation: ${judge.designation}` : "",
          judge.jurisdiction ? `Jurisdiction: ${judge.jurisdiction}` : "",
          judge.courtRoom ? `Court Room: ${judge.courtRoom}` : "",
          judge.vcLink ? `VC Link: ${judge.vcLink}` : "",
          judge.vcMeetingId ? `Meeting ID: ${judge.vcMeetingId}` : "",
          judge.email ? `Email: ${judge.email}` : "",
          judge.bench ? `Bench: ${judge.bench}` : "",
          "",
          "Shared via Lawyer2Lawyer",
        ]
          .filter(Boolean)
          .join("\n"),
        title: `${judge.name} - Court Details`,
      });
    } catch {
      // Silently fail
    }
  }, [judge]);

  return (
    <View style={styles.card}>
      {/* ── Top Accent Line ── */}
      <View style={styles.accentLine} />

      {/* ── Header: Judge Name + Designation ── */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {judge.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.judgeName}>{judge.name}</Text>
          {judge.designation ? (
            <Text style={styles.designation}>{judge.designation}</Text>
          ) : null}
          {judge.jurisdiction ? (
            <Text style={styles.jurisdictionText}>{judge.jurisdiction}</Text>
          ) : null}
        </View>
      </View>

      {/* ── Bench Chip ── */}
      {judge.bench ? (
        <View style={styles.benchChip}>
          <Ionicons name="git-branch-outline" size={13} color={ACCENT} />
          <Text style={styles.benchChipText}>{judge.bench}</Text>
        </View>
      ) : null}

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Details ── */}
      <View style={styles.detailsContainer}>
        {/* Court Room */}
        {judge.courtRoom ? (
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={16} color={ACCENT} />
            <Text style={styles.detailLabel}>Court Room</Text>
            <Text style={styles.detailValue}>{judge.courtRoom}</Text>
          </View>
        ) : null}

        {/* Virtual Court Meeting ID — Badge style */}
        {judge.vcMeetingId ? (
          <View style={styles.meetingIdRow}>
            <Ionicons name="videocam-outline" size={16} color={ACCENT} />
            <Text style={styles.meetingIdLabel}>Meeting ID</Text>
            <View style={styles.meetingIdBadge}>
              <Text style={styles.meetingIdBadgeText} selectable>
                {judge.vcMeetingId}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Email — Tappable */}
        {judge.email ? (
          <TouchableOpacity
            style={styles.emailRow}
            onPress={handleEmail}
            activeOpacity={0.7}
          >
            <Ionicons name="mail-outline" size={16} color={ACCENT} />
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.emailValue} numberOfLines={1}>
              {judge.email}
            </Text>
            <Ionicons name="open-outline" size={14} color={TEXT_MUTED} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ── Footer Actions ── */}
      <View style={styles.footer}>
        {/* Join Virtual Court — only if vcLink exists */}
        {judge.vcLink ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.joinBtn]}
            onPress={handleJoinVC}
            activeOpacity={0.8}
          >
            <Ionicons name="videocam" size={16} color="#FFFFFF" />
            <Text style={[styles.actionBtnText, styles.joinBtnText]}>
              Join Virtual Court
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.actionBtn, styles.shareBtn]}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Ionicons name="share-outline" size={16} color={ACCENT} />
          <Text style={[styles.actionBtnText, styles.shareBtnText]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ─────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: SURFACE_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 20,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
      },
    }),
  },
  accentLine: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: ACCENT_DARK,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: ACCENT_DARK,
    fontSize: 22,
    fontWeight: "800",
  },
  headerTextWrap: {
    flex: 1,
    gap: 2,
  },
  judgeName: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  designation: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  jurisdictionText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
  },
  benchChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  benchChipText: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_COLOR,
    marginVertical: 8,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(250, 249, 246, 0.6)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  detailLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "800",
    minWidth: 68,
  },
  detailValue: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  meetingIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(250, 249, 246, 0.6)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  meetingIdLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "800",
    minWidth: 68,
  },
  meetingIdBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  meetingIdBadgeText: {
    color: ACCENT_DARK,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(250, 249, 246, 0.6)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  emailValue: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    textDecorationLine: "underline",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
  },
  joinBtn: {
    backgroundColor: ACCENT,
  },
  shareBtn: {
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  joinBtnText: {
    color: "#FFFFFF",
  },
  shareBtnText: {
    color: ACCENT,
  },
});

export default JudgeCard;

