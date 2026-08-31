import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";
import type { QuickAction } from "./types";

interface QuickActionsGridProps {
  actions?: QuickAction[];
}

const GOLD = colors.accent.gold;
const TEXT_PRIMARY = colors.text.primary;

// Default quick actions for the dashboard
const DEFAULT_ACTIONS: QuickAction[] = [
  { id: "add-case", title: "Add Case", icon: "briefcase-outline", screen: "/cases/new" },
  { id: "court-diary", title: "Court Diary", icon: "calendar-outline", screen: "/court-diary" },
  { id: "clients", title: "Clients", icon: "people-outline", screen: "/lawyers" },
  { id: "payments", title: "Payments", icon: "cash-outline", screen: "/cases" },
  { id: "draft-library", title: "Draft Library", icon: "document-text-outline", screen: "/draft-library" },
  { id: "bare-acts", title: "Bare Acts", icon: "book-outline", screen: "/bare-acts" },
  { id: "judgments", title: "Judgments", icon: "scale-outline", screen: "/supreme-court" },
  { id: "notifications", title: "Notifications", icon: "notifications-outline", screen: "/notifications" },
  { id: "ai-assistant", title: "AI Assistant", icon: "bulb-outline", screen: "/ai-assistant" },
  { id: "supreme-court", title: "Supreme Court", icon: "globe-outline", screen: "/supreme-court" },
  { id: "delhi-high-court", title: "Delhi High Court", icon: "business-outline", screen: "/delhi-courts" },
  { id: "district-courts", title: "District Courts", icon: "library-outline", screen: "/delhi-courts" },
  { id: "video-conference", title: "Video Conference", icon: "videocam-outline", screen: "/supreme-court" },
  { id: "calendar", title: "Calendar", icon: "calendar-number-outline", screen: "/court-diary" },
  { id: "search", title: "Search", icon: "search-outline", screen: "/cases" },
  { id: "settings", title: "Settings", icon: "settings-outline", screen: "/profile" },
];

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ actions }) => {
  const quickActions = actions || DEFAULT_ACTIONS;
  const { width: windowWidth } = useWindowDimensions();

  const layout = useMemo(() => {
    // Strict: exactly 3 columns.
    const columns = 3;

    // Keep small to avoid overflow on narrow devices.
    const sidePadding = 12;
    const gap = 10;

    const availableWidth = windowWidth - sidePadding * 2 - gap * (columns - 1);
    const tileSize = Math.max(0, Math.floor(availableWidth / columns));

    // Vertical spacing must match horizontal spacing feel.
    const rowGap = gap;

    return { columns, sidePadding, gap, tileSize, rowGap };
  }, [windowWidth]);

  const handlePress = (screen: string) => {
    router.push(screen as any);
  };

  const renderItem = ({ item }: { item: QuickAction }) => {
    return (
      <View style={{ width: layout.tileSize, height: layout.tileSize }}>
        <GlassCard
          borderColor={colors.border.goldLight}
          accent={GOLD}
          onPress={() => handlePress(item.screen)}
          style={{ width: layout.tileSize, height: layout.tileSize }}
          contentStyle={styles.tileContent}
          elevation={1}
        >
          <View style={styles.actionTileInner}>
            <View style={styles.actionIconWrap}>
              <Ionicons name={item.icon as any} size={26} color={GOLD} />
            </View>
            <Text style={styles.actionTileText} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        </GlassCard>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Quick Actions</Text>

      <FlatList
        data={quickActions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={layout.columns}
        scrollEnabled={false}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        contentContainerStyle={{
          paddingHorizontal: layout.sidePadding,
        }}
        // Ensure consistent vertical spacing between rows.
        ItemSeparatorComponent={() => <View style={{ height: layout.rowGap }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sectionHeader: {
    color: TEXT_PRIMARY,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
    marginBottom: spacing.sm,
  },

  // Override default GlassCard padding(16) for compact dashboard tiles.
  tileContent: {
    padding: 0,
  },

  actionTileInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  actionIconWrap: {
    width: 40,
    height: 46,
    borderRadius: radii.lg,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  actionTileText: {
    color: TEXT_PRIMARY,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
  },
});

export default QuickActionsGrid;