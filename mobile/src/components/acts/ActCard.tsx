import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import { colors, radii } from "@/theme/designSystem";
import { MaxContentWidth } from "@/constants/theme";

export type ActCardData = {
  id: string;
  title: string;
  year?: number | string;
  shortDescription?: string;
  category?: string;
  pdfUrl?: string | null;
  searchSupport?: string;
  favoriteSupported?: boolean;
  bookmarkSupported?: boolean;
  aiExplanationSupported?: boolean;
};

export default function ActCard({
  act,
  isFavorited,
  isBookmarked,
  onToggleFavorite,
  onToggleBookmark,
  onPressPrimary,
}: {
  act: ActCardData;
  isFavorited: boolean;
  isBookmarked: boolean;
  onToggleFavorite: (actId: string) => void;
  onToggleBookmark: (actId: string) => void;
  onPressPrimary: (actId: string) => void;
}) {
  const yearText = act.year ? String(act.year) : "";

  return (
    <GlassCard
      style={[
        styles.cardSurface,
        { backgroundColor: "#FAF9F6", maxWidth: MaxContentWidth, alignSelf: "center" },
      ]}
      borderColor="rgba(181, 141, 61, 0.18)"
      accent="#B58D3D"
      elevation={1}
      onPress={() => onPressPrimary(act.id)}
    >
      <View style={styles.row}>
        <View style={styles.accentBar} />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.title} numberOfLines={2}>
                {act.title}
              </Text>
              <View style={styles.metaRow}>
                {yearText ? (
                  <View style={styles.yearPill}>
                    <Text style={styles.yearPillText}>{yearText}</Text>
                  </View>
                ) : null}
                {act.category ? (
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{act.category}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.iconCol}>
              {act.favoriteSupported !== false && (
                <Pressable
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    onToggleFavorite(act.id);
                  }}
                  style={({ hovered }) => [styles.iconBtn, hovered && styles.iconBtnHover]}
                  accessibilityRole="button"
                  accessibilityLabel={isFavorited ? "Remove from favourites" : "Add to favourites"}
                >
                  <Ionicons
                    name={isFavorited ? "heart" : "heart-outline"}
                    size={20}
                    color={isFavorited ? "#DC2626" : "rgba(120,100,80,0.85)"}
                  />
                </Pressable>
              )}
              {act.bookmarkSupported && (
                <Pressable
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    onToggleBookmark(act.id);
                  }}
                  style={({ hovered }) => [styles.iconBtn, hovered && styles.iconBtnHover]}
                  accessibilityRole="button"
                  accessibilityLabel={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <Ionicons
                    name={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={isBookmarked ? "#B58D3D" : "rgba(120,100,80,0.85)"}
                  />
                </Pressable>
              )}
            </View>
          </View>

          {act.shortDescription ? (
            <Text style={styles.desc} numberOfLines={2}>
              {act.shortDescription}
            </Text>
          ) : null}

          <View style={styles.footerRow}>
            <View style={styles.leftFooter}>
              {act.pdfUrl ? (
                <View style={styles.pdfPill}>
                  <Ionicons name="document-text-outline" size={12} color="#B58D3D" />
                  <Text style={styles.pdfPillText}>PDF Available</Text>
                </View>
              ) : (
                <View style={styles.pdfPillSoon}>
                  <Text style={styles.pdfPillSoonText}>PDF soon</Text>
                </View>
              )}
              {act.aiExplanationSupported ? (
                <View style={styles.aiPill}>
                  <Text style={styles.aiPillText}>AI</Text>
                </View>
              ) : null}
            </View>

            {act.pdfUrl ? (
              <Pressable
                onPress={(e) => {
                  e?.stopPropagation?.();
                  onPressPrimary(act.id);
                }}
                style={styles.ctaBtn}
                accessibilityRole="button"
                accessibilityLabel="Read act"
              >
                <Text style={styles.ctaText}>Read Act</Text>
                <Ionicons name="arrow-forward" size={14} color="#D4AF37" />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  cardSurface: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(181, 141, 61, 0.18)",
    overflow: "hidden",
    marginHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  accentBar: {
    width: 3,
    backgroundColor: colors.accent.gold,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
    alignItems: "center",
  },
  yearPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(212,175,55,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
  },
  yearPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.accent.gold,
    letterSpacing: 0.3,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  iconCol: {
    width: 36,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.22)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  iconBtnHover: {
    backgroundColor: "rgba(212,175,55,0.10)",
    borderColor: "rgba(212,175,55,0.45)",
  },
  desc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
  },
  footerRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftFooter: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  pdfPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(212,175,55,0.10)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
  },
  pdfPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B58D3D",
  },
  pdfPillSoon: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(148,163,184,0.08)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
  },
  pdfPillSoonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
  },
  aiPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(181,141,61,0.10)",
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
  },
  aiPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B58D3D",
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.35)",
    backgroundColor: "rgba(212,175,55,0.08)",
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D4AF37",
  },
});
