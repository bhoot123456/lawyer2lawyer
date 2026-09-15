import React, { memo, useMemo } from "react";
import { colors } from "@/theme/designSystem";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { blurActiveElement } from "@/utils/blurActiveElement";
import {
  getComplexById,
  COURT_COMPLEXES,
} from "@/data/delhiDistrictCourts";
import type { District } from "@/data/delhiDistrictCourts";

// ─────────────────────────────────────────────────────────
// Constants
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
  complexTitle,
}: {
  complexTitle: string;
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
          <Ionicons name="business-outline" size={22} color={ACCENT_DARK} />
        </View>
        <View>
          <Text style={styles.headerTitle}>{complexTitle}</Text>
          <Text style={styles.headerSubtitle}>Select a District</Text>
        </View>
      </View>
    </View>
  );
});

const DistrictCard = memo(function DistrictCard({
  district,
  complexId,
}: {
  district: District;
  complexId: string;
}) {
  return (
    <Pressable
      onPress={() => {
        blurActiveElement();
        router.push(
          `/delhi-district-courts/${complexId}/${district.id}` as any,
        );
      }}
      style={({ pressed }) => [
        styles.districtCard,
        pressed && {
          opacity: 0.85,
          transform: [{ scale: 0.98 }],
        },
      ]}
      accessibilityLabel={`${district.title}: ${district.subtitle}`}
      accessibilityRole="button"
    >
      <View style={styles.districtIconWrap}>
        <Ionicons name="flag-outline" size={24} color={ACCENT} />
      </View>
      <View style={styles.districtTextWrap}>
        <Text style={styles.districtTitle}>{district.title}</Text>
        <Text style={styles.districtSubtitle}>
          Official District Court Services
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={ACCENT} />
    </Pressable>
  );
});

const InfoFooter = memo(function InfoFooter() {
  return (
    <View style={styles.footerHint}>
      <Ionicons name="information-circle-outline" size={16} color={ACCENT} />
      <Text style={styles.footerHintText}>
        Information is indicative—always verify details from the official
        district court website or registry.
      </Text>
    </View>
  );
});

// ─────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────

export default function ComplexScreen() {
  const { complexId } = useLocalSearchParams<{ complexId: string }>();
  const complex = getComplexById(complexId ?? "");

  const renderedDistricts = useMemo(
    () =>
      complex?.districts.map((district) => (
        <DistrictCard
          key={district.id}
          district={district}
          complexId={complex.id}
        />
      )) ?? [],
    [complex],
  );

  // Fallback for invalid complexId
  if (!complex) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
          <View style={styles.introBlock}>
            <Text style={styles.introTitle}>Court Complex Not Found</Text>
            <Text style={styles.introText}>
              Please go back and select a valid court complex.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header complexTitle={complex.title} />

        <View style={styles.introBlock}>
          <Text style={styles.introTitle}>{complex.title}</Text>
          <Text style={styles.introText}>
            {complex.subtitle}. Select a district below to access court
            services including Judges List, Bail Roster, Cause List, and more.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Districts</Text>

        <View style={styles.districtsContainer}>{renderedDistricts}</View>

        <InfoFooter />
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  introTitle: {
    color: ACCENT_DARK,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  introText: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "600",
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
  districtsContainer: {
    gap: 12,
  },

  // District card (large premium card)
  districtCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 14,
    // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
  },
  districtIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accent.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  districtTextWrap: {
    flex: 1,
    gap: 4,
  },
  districtTitle: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "800",
  },
  districtSubtitle: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "600",
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

