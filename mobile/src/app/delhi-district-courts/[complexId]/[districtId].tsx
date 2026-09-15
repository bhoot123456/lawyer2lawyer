import React, { memo, useCallback, useMemo } from "react";
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
import { openOfficialCourtLink } from "@/utils/openOfficialCourtLink";
import {
  getComplexById,
  getDistrictById,
  DISTRICT_SERVICES,
} from "@/data/delhiDistrictCourts";
import type { DistrictService } from "@/data/delhiDistrictCourts";

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
  districtTitle,
}: {
  districtTitle: string;
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
          <Ionicons name="flag-outline" size={22} color={ACCENT_DARK} />
        </View>
        <View>
          <Text style={styles.headerTitle}>{districtTitle}</Text>
          <Text style={styles.headerSubtitle}>
            Official Delhi District Court
          </Text>
        </View>
      </View>
    </View>
  );
});

const ServiceCard = memo(function ServiceCard({
  service,
  complexId,
  districtId,
}: {
  service: DistrictService;
  complexId: string;
  districtId: string;
}) {
  const handlePress = useCallback(() => {
    blurActiveElement();
    if (service.id === "judges-list") {
      // Navigate to the judges list screen using Expo Router
      router.push(
        `/delhi-district-courts/${complexId}/${districtId}/judges-list` as any,
      );
    } else if (service.id === "judges-on-leave") {
      // Navigate to the judges on leave screen
      router.push(
        `/delhi-district-courts/${complexId}/${districtId}/judges-on-leave` as any,
      );
    } else {
      // For all other services, open the official court website
      openOfficialCourtLink(
        "",
        service.title,
      );
    }
  }, [service.id, service.title, complexId, districtId]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.serviceCard,
        pressed && {
          opacity: 0.85,
          transform: [{ scale: 0.98 }],
        },
      ]}
      accessibilityLabel={`${service.title}: ${service.description}`}
      accessibilityRole="button"
    >
      <View style={styles.serviceIconWrap}>
        <Ionicons name={service.icon} size={24} color={ACCENT} />
      </View>
      <View style={styles.serviceTextWrap}>
        <Text style={styles.serviceTitle}>{service.title}</Text>
        <Text style={styles.serviceDescription} numberOfLines={1}>
          {service.description}
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

export default function DistrictScreen() {
  const { complexId, districtId } = useLocalSearchParams<{
    complexId: string;
    districtId: string;
  }>();

  const district = getDistrictById(complexId ?? "", districtId ?? "");
  const complex = getComplexById(complexId ?? "");

  const renderedServices = useMemo(
    () =>
      DISTRICT_SERVICES.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          complexId={complexId ?? ""}
          districtId={districtId ?? ""}
        />
      )),
    [complexId, districtId],
  );

  // Fallback for invalid districtId
  if (!district || !complex) {
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
            <Text style={styles.introTitle}>District Not Found</Text>
            <Text style={styles.introText}>
              Please go back and select a valid district.
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
        <Header districtTitle={district.title} />

        <View style={styles.introBlock}>
          <Text style={styles.introTitle}>{district.title}</Text>
          <Text style={styles.introText}>
            {complex.title} — {district.subtitle}. Access district court
            services below.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Available Services</Text>

        <View style={styles.servicesContainer}>{renderedServices}</View>

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
  servicesContainer: {
    gap: 10,
  },

  // Service card (same as original)
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  serviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTextWrap: {
    flex: 1,
    gap: 2,
  },
  serviceTitle: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "800",
  },
  serviceDescription: {
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

