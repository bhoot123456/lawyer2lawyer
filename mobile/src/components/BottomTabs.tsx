import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, router } from "expo-router";
import { blurActiveElement } from "@/utils/blurActiveElement";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

type TabDef = {
  key: "home" | "cases" | "calendar" | "knowledge" | "profile";
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const TABS: TabDef[] = [
  {
    key: "home",
    label: "Home",
    route: "/",
    icon: "home-outline" as any,
    activeIcon: "home" as any,
  },
  {
    key: "cases",
    label: "Cases",
    route: "/cases",
    icon: "briefcase-outline" as any,
    activeIcon: "briefcase" as any,
  },
  {
    key: "calendar",
    label: "Diary",
    route: "/court-diary",
    icon: "time-outline" as any,
    activeIcon: "time" as any,
  },
  {
    key: "knowledge",
    label: "Knowledge",
    route: "/knowledge-hub",
    icon: "book-outline" as any,
    activeIcon: "book" as any,
  },
  {
    key: "profile",
    label: "Profile",
    route: "/dashboard",
    icon: "person-outline" as any,
    activeIcon: "person" as any,
  },
];

export default function BottomTabs() {
  const pathname = usePathname();

  const isActiveRoute = (route: string) => {
    if (route === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname === route;
  };

  return (
    <View style={styles.wrapper}>
      {TABS.map((tab) => {
        const active = isActiveRoute(tab.route);
        return (
          <Pressable
            key={tab.key}
            onPress={() => {
              blurActiveElement();
              router.push(tab.route as any);
            }}
            style={({ pressed }) => [
              styles.tab,
              active ? styles.tabActive : null,
              pressed && styles.tabPressed,
            ]}
          >
            <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
              <Ionicons
                name={active ? tab.activeIcon : tab.icon}
                size={22}
                color={active ? colors.accent.gold : colors.text.muted}
              />
            </View>
            <Text style={[styles.label, active ? styles.labelActive : null]}>
              {tab.label}
            </Text>
            {active ? <View style={styles.activeIndicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(20, 20, 22, 0.92)",
    borderTopWidth: 1,
    borderTopColor: colors.border.goldLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-around",
    gap: spacing.sm,
    ...shadows.level3,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    gap: 4,
    position: "relative",
  },
  tabActive: {
    backgroundColor: colors.accent.goldSubtle,
  },
  tabPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    backgroundColor: "rgba(212,175,55,0.10)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
  },
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.text.muted,
  },
  labelActive: {
    color: colors.accent.gold,
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent.gold,
  },
});

