import React from "react";
import { View, Text, StyleSheet, Pressable, Linking, Alert, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { colors, radii, spacing, typography } from "@/theme/designSystem";

type Tribunal = {
  principalBench?: boolean;
  _id?: string;
  name?: string;
  abbreviation?: string;
  category?: string;
  jurisdiction?: string;
  description?: string;
  location?: string;
  website?: string;
  subCategory?: string;
  tribunalType?: string;
  jurisdictionLevel?: string;
  state?: string;
  district?: string;
  benchType?: string;
  benchName?: string;
  benchCode?: string;
  address?: string;
  city?: string;
  pincode?: string;
  email?: string;
  phone?: string;
  fax?: string;
  googleMapsLink?: string;
  workingDays?: string;
  workingHours?: string;
  filingMode?: string;
  eFilingAvailable?: boolean;
  videoConferenceAvailable?: boolean;
  causeListLink?: string;
  ordersLink?: string;
  judgmentsLink?: string;
  notificationsLink?: string;
  circularsLink?: string;
  formsLink?: string;
  rulesLink?: string;
  governingActLink?: string;
  governingAct?: string;
  isFeatured?: boolean;
  lastVerifiedAt?: string;
};

type Props = {
  tribunal: Tribunal;
  onPress?: (t: Tribunal) => void;
};

const COLORS = {
  blue: "#4A90E2",
  green: "#50C878",
  amber: "#FF8C42",
  purple: "#9B59B6",
  teal: "#1ABC9C",
  navy: "#1E3A8A",
};

const TribunalCard = React.memo(function TribunalCard({ tribunal, onPress }: Props) {
  const [expanded, setExpanded] = React.useState(false);

  const openLink = React.useCallback((url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  }, []);

  const copyToClipboard = React.useCallback((text?: string) => {
    if (!text) return;
    Alert.alert("Copied", text);
  }, []);

  const shareTribunal = React.useCallback(() => {
    const name = tribunal?.name || "Tribunal";
    const message = `${name}${tribunal?.abbreviation ? ` (${tribunal.abbreviation})` : ""}\n${tribunal?.address || tribunal?.location || ""}\n${tribunal?.phone ? `Phone: ${tribunal.phone}` : ""}`;
    Share.share({ title: name, message }).catch(() => {});
  }, [tribunal]);

  const addressLine = React.useMemo(() => {
    const parts = [tribunal?.address, tribunal?.city, tribunal?.pincode, tribunal?.state].filter(Boolean);
    return parts.join(", ") || tribunal?.location || "";
  }, [tribunal]);

  const resourceLinks = React.useMemo(() => {
    const links: { label: string; url?: string; color: string }[] = [
      { label: "Cause List", url: tribunal?.causeListLink, color: COLORS.blue },
      { label: "Judgments", url: tribunal?.judgmentsLink, color: COLORS.green },
      { label: "Orders", url: tribunal?.ordersLink, color: COLORS.amber },
      { label: "Notifications", url: tribunal?.notificationsLink, color: COLORS.purple },
      { label: "Circulars", url: tribunal?.circularsLink, color: COLORS.teal },
      { label: "Rules", url: tribunal?.rulesLink, color: COLORS.navy },
      { label: "Forms", url: tribunal?.formsLink, color: COLORS.amber },
      { label: "Governing Act", url: tribunal?.governingActLink, color: COLORS.blue },
    ];
    return links.filter((l) => !!l.url);
  }, [tribunal]);

  const handleToggleExpand = React.useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleWebsite = React.useCallback(() => {
    openLink(tribunal?.website);
  }, [tribunal?.website, openLink]);

  const handleDirections = React.useCallback(() => {
    const mapsUrl = tribunal?.googleMapsLink || addressLine;
    if (mapsUrl) {
      if (mapsUrl.startsWith("http")) {
        openLink(mapsUrl);
      } else {
        openLink(`https://maps.google.com/?q=${encodeURIComponent(mapsUrl)}`);
      }
    }
  }, [tribunal?.googleMapsLink, addressLine, openLink]);

  const handleMoreDetails = React.useCallback(() => {
    handleToggleExpand();
  }, [handleToggleExpand]);

  const cardContent = (
    <>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name} numberOfLines={2}>
            {tribunal?.name || "—"}
          </Text>
          {tribunal?.abbreviation ? (
            <View style={styles.abbreviationBadge}>
              <Text style={styles.abbreviationText}>{tribunal.abbreviation}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.headerRight}>
          {tribunal?.isFeatured ? (
            <StatusBadge label="Featured" variant="gold" dot />
          ) : null}
          {tribunal?.lastVerifiedAt ? (
            <StatusBadge label="Verified" variant="success" dot />
          ) : null}
        </View>
      </View>

      <View style={styles.badgesRow}>
        {tribunal?.category ? (
          <View style={[styles.categoryBadge, { backgroundColor: `${COLORS.blue}15`, borderColor: `${COLORS.blue}40` }]}>
            <Text style={[styles.categoryBadgeText, { color: COLORS.blue }]}>
              {tribunal.category}
            </Text>
          </View>
        ) : null}
        {tribunal?.jurisdictionLevel ? (
          <View style={[styles.categoryBadge, { backgroundColor: `${COLORS.green}15`, borderColor: `${COLORS.green}40` }]}>
            <Text style={[styles.categoryBadgeText, { color: COLORS.green }]}>
              {tribunal.jurisdictionLevel}
            </Text>
          </View>
        ) : null}
        {tribunal?.jurisdiction ? (
          <View style={[styles.categoryBadge, { backgroundColor: `${COLORS.purple}15`, borderColor: `${COLORS.purple}40` }]}>
            <Text style={[styles.categoryBadgeText, { color: COLORS.purple }]}>
              {tribunal.jurisdiction}
            </Text>
          </View>
        ) : null}
      </View>

      {tribunal?.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {tribunal.description}
        </Text>
      ) : null}

      {(tribunal?.eFilingAvailable || tribunal?.videoConferenceAvailable) ? (
        <View style={styles.flagsRow}>
          {tribunal.eFilingAvailable ? (
            <View style={[styles.flag, { backgroundColor: `${COLORS.green}12`, borderColor: `${COLORS.green}35` }]}>
              <Text style={[styles.flagText, { color: COLORS.green }]}>e-Filing</Text>
            </View>
          ) : null}
          {tribunal.videoConferenceAvailable ? (
            <View style={[styles.flag, { backgroundColor: `${COLORS.blue}12`, borderColor: `${COLORS.blue}35` }]}>
              <Text style={[styles.flagText, { color: COLORS.blue }]}>Video Conference</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable onPress={handleWebsite} style={styles.actionButton}>
          <Ionicons name="globe-outline" size={16} color={colors.accent.gold} />
          <Text style={styles.actionText}>Website</Text>
        </Pressable>
        <Pressable onPress={handleDirections} style={styles.actionButton}>
          <Ionicons name="navigate-outline" size={16} color={colors.accent.gold} />
          <Text style={styles.actionText}>Directions</Text>
        </Pressable>
        <Pressable onPress={handleMoreDetails} style={styles.actionButton}>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.accent.gold} />
          <Text style={styles.actionText}>{expanded ? "Less" : "Details"}</Text>
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.divider} />

          <View style={styles.detailsGrid}>
            {tribunal?.benchName ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bench</Text>
                <Text style={styles.detailValue}>{tribunal.benchName}</Text>
              </View>
            ) : null}
            {tribunal?.benchType ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bench Type</Text>
                <Text style={styles.detailValue}>{tribunal.benchType}</Text>
              </View>
            ) : null}
            {tribunal?.principalBench ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Principal Bench</Text>
                <Text style={styles.detailValue}>Principal Bench</Text>
              </View>
            ) : null}
            {tribunal?.governingAct ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Governing Act</Text>
                <Text style={styles.detailValue}>{tribunal.governingAct}</Text>
              </View>
            ) : null}
            {tribunal?.filingMode ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Filing Mode</Text>
                <Text style={styles.detailValue}>{tribunal.filingMode}</Text>
              </View>
            ) : null}
            {tribunal?.email ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{tribunal.email}</Text>
              </View>
            ) : null}
            {tribunal?.phone ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{tribunal.phone}</Text>
              </View>
            ) : null}
          </View>

          {resourceLinks.length > 0 && (
            <View style={styles.resources}>
              <Text style={styles.resourcesTitle}>Official Resources</Text>
              <View style={styles.resourcesGrid}>
                {resourceLinks.map((resource) => (
                  <Pressable
                    key={resource.label}
                    onPress={() => openLink(resource.url)}
                    style={({ pressed }) => [
                      styles.resourceChip,
                      { borderColor: `${resource.color}40`, backgroundColor: `${resource.color}10` },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={[styles.resourceChipText, { color: resource.color }]}>
                      {resource.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.quickActionsRow}>
            <Pressable onPress={() => openLink(tribunal?.phone ? `tel:${tribunal.phone}` : undefined)} style={styles.quickActionButton}>
              <Ionicons name="call-outline" size={16} color={colors.accent.gold} />
              <Text style={styles.quickActionText}>Call</Text>
            </Pressable>
            <Pressable onPress={() => openLink(tribunal?.email ? `mailto:${tribunal.email}` : undefined)} style={styles.quickActionButton}>
              <Ionicons name="mail-outline" size={16} color={colors.accent.gold} />
              <Text style={styles.quickActionText}>Email</Text>
            </Pressable>
            <Pressable onPress={() => copyToClipboard(addressLine)} style={styles.quickActionButton}>
              <Ionicons name="copy-outline" size={16} color={colors.accent.gold} />
              <Text style={styles.quickActionText}>Copy</Text>
            </Pressable>
            <Pressable onPress={shareTribunal} style={styles.quickActionButton}>
              <Ionicons name="share-outline" size={16} color={colors.accent.gold} />
              <Text style={styles.quickActionText}>Share</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );

  return (
    <Pressable onPress={() => onPress?.(tribunal)}>
      <GlassCard
        borderColor={colors.border.goldLight}
        accent={colors.accent.gold}
        style={styles.card}
        elevation={1}
      >
        {cardContent}
      </GlassCard>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
    gap: spacing.sm,
  },
  name: {
    color: colors.text.primary,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    lineHeight: typography.h4.lineHeight,
  },
  abbreviationBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
  },
  abbreviationText: {
    color: colors.accent.gold,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    gap: 6,
    flexShrink: 0,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  description: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  flagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  flag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  flagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  actionText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  expandedSection: {
    gap: spacing.sm,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: 4,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  detailItem: {
    flex: 1,
    minWidth: "45%",
    gap: 4,
  },
  detailLabel: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    color: colors.text.primary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
  resources: {
    gap: 8,
  },
  resourcesTitle: {
    color: colors.accent.gold,
    fontSize: typography.caption.fontSize,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resourcesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  resourceChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  resourceChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  quickActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  quickActionText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});

export default TribunalCard;