import React, { useCallback } from "react";
import { colors } from "@/theme/designSystem";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import type { SupremeCourtCardProps } from "@/types/supremeCourt";

/**
 * Status badge colors mapping.
 */
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Live: {
    bg: "rgba(34, 197, 94, 0.12)",
    text: "#22C55E",
    dot: "#22C55E",
  },
  Scheduled: {
    bg: "rgba(251, 191, 36, 0.12)",
    text: "#F59E0B",
    dot: "#F59E0B",
  },
  Offline: {
    bg: "rgba(100, 116, 139, 0.12)",
    text: "#94A3B8",
    dot: "#94A3B8",
  },
};

/**
 * SupremeCourtCard – Displays a court room in a premium card with all interactive actions.
 */
const SupremeCourtCard: React.FC<SupremeCourtCardProps> = ({
  court,
  onFavouriteToggle,
  onCopyLink,
  onShare,
  onJoinVC,
}) => {
  const courtId = court._id || court.id || court.courtRoom;
  const statusStyle = STATUS_COLORS[court.status] || STATUS_COLORS.Offline;
  const isFav = court.isFavourite ?? false;

  /**
   * Open VC link using Linking.
   */
  const handleJoinVC = useCallback(() => {
    if (court.vcLink) {
      Linking.openURL(court.vcLink).catch(() => {
        // Fallback: copy link if unable to open
        Clipboard.setStringAsync(court.vcLink);
      });
    }
  }, [court.vcLink]);

  /**
   * Copy link to clipboard with visual feedback and notify parent.
   */
  const handleCopyLink = useCallback(async () => {
    if (court.vcLink) {
      await Clipboard.setStringAsync(court.vcLink);
      onCopyLink(court.vcLink);
    }
  }, [court.vcLink, onCopyLink]);

  /**
   * Share court meeting details.
   */
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: [
          `🏛️ ${court.courtRoom}`,
          `Status: ${court.status}`,
          court.vcLink ? `VC Link: ${court.vcLink}` : "",
          court.meetingId ? `Meeting ID: ${court.meetingId}` : "",
          court.email ? `Email: ${court.email}` : "",
          "",
          "Shared via Lawyer2Lawyer",
        ]
          .filter(Boolean)
          .join("\n"),
        title: `${court.courtRoom} - Meeting Details`,
      });
    } catch {
      // Silently fail if share is cancelled
    }
  }, [court]);

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Court Room Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="business-outline" size={20} color="#D4AF37" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.courtRoomName}>{court.courtRoom}</Text>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {court.status}
              </Text>
            </View>
          </View>

          {/* Favourite Button */}
          <TouchableOpacity
            style={styles.favButton}
            onPress={() => onFavouriteToggle(courtId)}
            activeOpacity={0.7}
            accessibilityLabel={
              isFav ? "Remove from favourites" : "Add to favourites"
            }
            accessibilityRole="button"
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={22}
              color={isFav ? "#EF4444" : "#94A3B8"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Body - Details */}
      <View style={styles.detailsContainer}>
        {/* VC Link Row */}
        {court.vcLink ? (
          <TouchableOpacity
            style={styles.detailRow}
            onPress={handleCopyLink}
            activeOpacity={0.7}
            accessibilityLabel={`Copy VC link for ${court.courtRoom}`}
            accessibilityRole="button"
          >
            <Ionicons name="link-outline" size={16} color={colors.accent.gold} />
            <Text style={styles.detailLabel}>VC Link</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {court.vcLink.replace(/^https?:\/\//, "")}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyLink}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="copy-outline" size={14} color={colors.accent.gold} />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ) : null}

        {/* Meeting ID Row */}
        {court.meetingId ? (
          <View style={styles.detailRow}>
            <Ionicons name="videocam-outline" size={16} color={colors.accent.gold} />
            <Text style={styles.detailLabel}>Meeting ID</Text>
            <Text style={styles.detailValue} selectable>
              {court.meetingId}
            </Text>
          </View>
        ) : null}

        {/* Email Row */}
        {court.email ? (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color={colors.accent.gold} />
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue} selectable>
              {court.email}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Card Footer - Action Buttons */}
      <View style={styles.footer}>
        {/* Join VC Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.joinButton,
            !court.vcLink && styles.actionButtonDisabled,
          ]}
          onPress={handleJoinVC}
          disabled={!court.vcLink}
          activeOpacity={0.8}
          accessibilityLabel={`Join VC for ${court.courtRoom}`}
          accessibilityRole="button"
        >
          <Ionicons
            name="videocam"
            size={16}
            color={court.vcLink ? "#FFFFFF" : "#64748B"}
          />
          <Text
            style={[
              styles.actionButtonText,
              styles.joinButtonText,
              !court.vcLink && styles.actionButtonTextDisabled,
            ]}
          >
            Join VC
          </Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          activeOpacity={0.8}
          accessibilityLabel={`Share ${court.courtRoom} details`}
          accessibilityRole="button"
        >
          <Ionicons name="share-outline" size={16} color={colors.accent.gold} />
          <Text style={[styles.actionButtonText, styles.shareButtonText]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gold accent bottom line */}
      <View style={styles.accentLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
      },
    }),
  },
  header: {
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.border.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  courtRoomName: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  favButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsContainer: {
    gap: 10,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.accent.goldLight,
  },
  detailLabel: {
    color: "rgba(248, 250, 252, 0.6)",
    fontSize: 12,
    fontWeight: "800",
    minWidth: 72,
  },
  detailValue: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent.goldLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  copyText: {
    color: colors.accent.gold,
    fontSize: 12,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  joinButton: {
    backgroundColor: colors.accent.gold,
  },
  shareButton: {
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.gold,
  },
  actionButtonDisabled: {
    backgroundColor: "rgba(100, 116, 139, 0.2)",
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  joinButtonText: {
    color: "#FFFFFF",
  },
  shareButtonText: {
    color: colors.accent.gold,
  },
  actionButtonTextDisabled: {
    color: "#64748B",
  },
  accentLine: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: colors.border.goldLight,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});

export default SupremeCourtCard;