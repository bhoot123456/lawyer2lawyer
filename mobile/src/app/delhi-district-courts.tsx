import React, { memo, useCallback, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { blurActiveElement } from "@/utils/blurActiveElement";
import { openOfficialCourtLink } from "@/utils/openOfficialCourtLink";
import {
  COURT_COMPLEXES,
  DISTRICT_SERVICES,
} from "@/data/delhiDistrictCourts";
import type { CourtComplex, District } from "@/data/delhiDistrictCourts";

// ─────────────────────────────────────────────────────────
// Enable LayoutAnimation on Android
// ─────────────────────────────────────────────────────────

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────

const ACCENT = "#B58D3D";
const ACCENT_DARK = "#D4AF37";
const BG_COLOR = "#FAF9F6";
const SURFACE_COLOR = "#FFFFFF";
const BORDER_COLOR = "#EAE5DB";
const TEXT_PRIMARY = "#1E293B";
const TEXT_MUTED = "#64748B";

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────

const Header = memo(function Header() {
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
          <Text style={styles.headerTitle}>Delhi District Courts</Text>
          <Text style={styles.headerSubtitle}>Official Court Services</Text>
        </View>
      </View>
    </View>
  );
});

// ─────────────────────────────────────────────────────────
// Service Pill — Reusable 2‑column service button
// ─────────────────────────────────────────────────────────

type ServicePillProps = {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly label: string;
  readonly serviceId?: string;
  readonly complexId?: string;
  readonly districtId?: string;
};

const ServicePill = memo(function ServicePill({
  icon,
  label,
  serviceId,
  complexId,
  districtId,
}: ServicePillProps) {
  const handlePress = useCallback(() => {
    blurActiveElement();
    if (serviceId === "judges-list" && complexId && districtId) {
      router.push(
        `/delhi-district-courts/${complexId}/${districtId}/judges-list` as any,
      );
      return;
    }
    if (serviceId === "judges-on-leave" && complexId && districtId) {
      router.push(
        `/delhi-district-courts/${complexId}/${districtId}/judges-on-leave` as any,
      );
      return;
    }
    openOfficialCourtLink(
      "https://districts.ecourts.gov.in/delhi",
      label,
    );
  }, [label, serviceId, complexId, districtId]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.servicePill,
        pressed && {
          opacity: 0.85,
          transform: [{ scale: 0.96 }],
        },
      ]}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View style={styles.servicePillIconWrap}>
        <Ionicons name={icon} size={20} color={ACCENT} />
      </View>
      <Text style={styles.servicePillLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
});

// ─────────────────────────────────────────────────────────
// Service Grid — 2‑column grid of service pills
// ─────────────────────────────────────────────────────────

const ServiceGrid = memo(function ServiceGrid({
  complexId,
  districtId,
}: {
  readonly complexId: string;
  readonly districtId: string;
}) {
  const pills = useMemo(
    () =>
      DISTRICT_SERVICES.map((svc) => (
        <ServicePill
          key={svc.id}
          icon={svc.icon}
          label={svc.title}
          serviceId={svc.id}
          complexId={complexId}
          districtId={districtId}
        />
      )),
    [complexId, districtId],
  );

  return <View style={styles.serviceGrid}>{pills}</View>;
});

// ─────────────────────────────────────────────────────────
// District Section — blue accent strip + service grid
// ─────────────────────────────────────────────────────────

const DistrictSection = memo(function DistrictSection({
  district,
  complexId,
}: {
  readonly district: District;
  readonly complexId: string;
}) {
  return (
    <View style={styles.districtSection}>
      <View style={styles.districtHeader}>
        <Ionicons
          name="flag-outline"
          size={16}
          color={ACCENT_DARK}
        />
        <Text style={styles.districtTitle}>{district.title}</Text>
      </View>
      <ServiceGrid complexId={complexId} districtId={district.id} />
    </View>
  );
});

// ─────────────────────────────────────────────────────────
// Accordion Card — court complex header + expandable body
// ─────────────────────────────────────────────────────────

type AccordionCardProps = {
  readonly complex: CourtComplex;
  readonly isExpanded: boolean;
  readonly onToggle: (id: string) => void;
};

const AccordionCard = memo(function AccordionCard({
  complex,
  isExpanded,
  onToggle,
}: AccordionCardProps) {
  const handleToggle = useCallback(() => {
    onToggle(complex.id);
  }, [complex.id, onToggle]);

const renderedDistricts = useMemo(
    () =>
      complex.districts.map((district) => (
        <DistrictSection
          key={district.id}
          district={district}
          complexId={complex.id}
        />
      )),
    [complex.districts, complex.id],
  );

  return (
    <View
      style={[
        styles.accordionCard,
        isExpanded && styles.accordionCardExpanded,
      ]}
    >
      {/* ── Accordion Header ── */}
      <Pressable
        onPress={handleToggle}
        style={({ pressed }) => [
          styles.accordionHeader,
          isExpanded && styles.accordionHeaderExpanded,
          pressed && styles.accordionHeaderPressed,
        ]}
        accessibilityLabel={
          isExpanded
            ? `Collapse ${complex.title}`
            : `Expand ${complex.title}`
        }
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.accordionHeaderLeft}>
          <View style={styles.accordionIconWrap}>
            <Ionicons
              name={complex.icon}
              size={22}
              color={ACCENT_DARK}
            />
          </View>
          <View style={styles.accordionHeaderText}>
            <Text style={styles.accordionTitle}>{complex.title}</Text>
            <Text style={styles.accordionSubtitle}>
              {complex.subtitle}
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={22}
          color={ACCENT_DARK}
        />
      </Pressable>

      {/* ── Expandable Body ── */}
      {isExpanded && (
        <View style={styles.accordionBody}>
          {renderedDistricts}
        </View>
      )}
    </View>
  );
});

// ─────────────────────────────────────────────────────────
// Info Footer
// ─────────────────────────────────────────────────────────

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

export default function DelhiDistrictCourtsScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const renderedAccordions = useMemo(
    () =>
      COURT_COMPLEXES.map((complex) => (
        <AccordionCard
          key={complex.id}
          complex={complex}
          isExpanded={expandedId === complex.id}
          onToggle={handleToggle}
        />
      )),
    [expandedId, handleToggle],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <View style={styles.introBlock}>
          <Text style={styles.introTitle}>
            Welcome to Delhi District Courts
          </Text>
          <Text style={styles.introText}>
            Select a court complex below to access district-specific services
            including Judges List, Bail Roster, Cause List, Case Status, and
            more.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Court Complexes</Text>

        <View style={styles.accordionContainer}>{renderedAccordions}</View>

        <InfoFooter />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Styles (existing design language preserved)
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

  // ── Header ──────────────────────────────────────────
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
    flex: 1,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(181, 141, 61, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  // ── Intro Block ─────────────────────────────────────
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
    fontWeight: "900",
    marginBottom: 8,
  },
  introText: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },

  // ── Section Label ───────────────────────────────────
  sectionLabel: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  // ── Accordion Container ────────────────────────────
  accordionContainer: {
    gap: 12,
  },

  // ── Accordion Card ────────────────────────────────
  accordionCard: {
    backgroundColor: SURFACE_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accordionCardExpanded: {
    // Slightly deeper shadow when expanded
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  // ── Accordion Header ───────────────────────────────
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SURFACE_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  accordionHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  accordionHeaderPressed: {
    opacity: 0.85,
  },
  accordionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  accordionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(181, 141, 61, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  accordionHeaderText: {
    flex: 1,
    gap: 2,
  },
  accordionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "800",
  },
  accordionSubtitle: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Accordion Body ─────────────────────────────────
  accordionBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },

  // ── District Section ───────────────────────────────
  districtSection: {
    gap: 10,
  },
  districtHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  districtTitle: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // ── Service Grid ───────────────────────────────────
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // ── Service Pill ───────────────────────────────────
  servicePill: {
    width: "48%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: SURFACE_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    minHeight: 48,
  },
  servicePillIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(181, 141, 61, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  servicePillLabel: {
    color: TEXT_PRIMARY,
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
    lineHeight: 15,
  },

  // ── Footer ─────────────────────────────────────────
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

