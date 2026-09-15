import React, { useMemo, useState } from "react";
import { View, StyleSheet, Pressable, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { blurActiveElement } from "@/utils/blurActiveElement";
import {
  radii,
  shadows,
  spacing,
  typography,
} from "@/theme/designSystem";
import { useThemeColors } from "@/theme/ThemeProvider";

/** Shell rhythm shared with FloatingAIAgent so FAB/tab bar never collide. */
export const SHELL_TAB_BAR_MIN_HEIGHT = 64;
export const SHELL_FAB_SIZE = 60;
export const SHELL_FAB_SLOT_WIDTH = 72;

type TabKey = "home" | "cases" | "legal" | "profile";

type TabDef = {
  key: TabKey;
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const LEFT_TABS: TabDef[] = [
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
];

const RIGHT_TABS: TabDef[] = [
  {
    key: "legal",
    label: "Legal",
    route: "/knowledge-hub",
    icon: "library-outline" as any,
    activeIcon: "library" as any,
  },
  {
    key: "profile",
    label: "Profile",
    route: "/dashboard",
    icon: "person-outline" as any,
    activeIcon: "person" as any,
  },
];

function isActiveTab(tab: TabDef, pathname: string): boolean {
  if (tab.key === "home") return pathname === "/";
  if (tab.key === "cases") return pathname === "/cases" || pathname.startsWith("/cases/");
  if (tab.key === "legal") return pathname.startsWith("/knowledge-hub");
  if (tab.key === "profile") return pathname.startsWith("/dashboard");
  return false;
}

function TabButton({
  tab,
  active,
}: {
  tab: TabDef;
  active: boolean;
}) {
  const colors = useThemeColors();
  const [hovered, setHovered] = useState(false);
  const isWeb = Platform.OS === "web";
  return (
    <Pressable
      onPress={() => {
        if (!active) {
          blurActiveElement();
          router.push(tab.route as any);
        }
      }}
      hitSlop={8}
      // @ts-expect-error — onMouseEnter/onMouseLeave are web-only props (react-native-web)
      onMouseEnter={isWeb ? () => setHovered(true) : undefined}
      onMouseLeave={isWeb ? () => setHovered(false) : undefined}
      style={({ pressed }) => [
        styles.tab,
        { minHeight: 56 },
        active ? { backgroundColor: colors.accent.goldSubtle } : null,
        hovered && isWeb && !active ? { backgroundColor: colors.accent.goldLight } : null,
        pressed && styles.tabPressed,
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tab.label}
      accessibilityHint={
        active ? `${tab.label}, selected tab` : `Go to ${tab.label}`
      }
    >
      <View
        style={[
          styles.iconContainer,
          active && {
            backgroundColor: colors.accent.goldSubtle,
            borderWidth: 1,
            borderColor: colors.border.gold,
          },
        ]}
      >
        <Ionicons
          name={active ? tab.activeIcon : tab.icon}
          size={22}
          color={active ? colors.accent.gold : colors.text.secondary}
        />
      </View>
      <Text
        style={[
          styles.label,
          { color: active ? colors.accent.gold : colors.text.secondary },
          active && styles.labelActive,
        ]}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

export default function BottomTabs() {
  const pathname = usePathname() ?? "";
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const isHidden = useMemo(() => {
    if (!pathname) return false;
    const hiddenPrefixes = ["/admin", "/login"];
    return hiddenPrefixes.some((p) => pathname.startsWith(p));
  }, [pathname]);

  if (isHidden) return null;

  const openNewCase = () => {
    blurActiveElement();
    router.push("/cases/new" as any);
  };

  return (
    <View
      style={[
        // pointerEvents must be part of the StyleSheet.create style so
        // react-native-web compiles the `box-none` polyfill (an inline
        // `{ pointerEvents: "box-none" }` object is invalid CSS on web and
        // makes this bar swallow all clicks).
        styles.wrapper,
        {
          backgroundColor: colors.bg.primary,
          paddingBottom: spacing.xs + Math.max(insets.bottom, 8),
          borderTopColor: colors.border.subtle,
        },
      ]}
    >
      <View style={styles.bar}>
        {LEFT_TABS.map((tab) => (
          <TabButton key={tab.key} tab={tab} active={isActiveTab(tab, pathname)} />
        ))}
        <View style={styles.fabSlot} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
        {RIGHT_TABS.map((tab) => (
          <TabButton key={tab.key} tab={tab} active={isActiveTab(tab, pathname)} />
        ))}
      </View>

      <Pressable
        onPress={openNewCase}
        accessibilityRole="button"
        accessibilityLabel="Create new case"
        accessibilityHint="Opens the new case form"
        accessibilityState={{ disabled: false }}
        hitSlop={12}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.accent.gold,
            borderColor: colors.bg.primary,
          },
          pressed && styles.fabPressed,
        ]}
      >
        <Ionicons name="add" size={28} color={colors.text.inverse} />
      </Pressable>
    </View>
  );
}

const BAR_MIN_HEIGHT = SHELL_TAB_BAR_MIN_HEIGHT;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    // Declared here (not inline) so react-native-web compiles the box-none
    // polyfill; see the comment in the render body.
    pointerEvents: "box-none",
    alignItems: "center",
    // Background is supplied inline from useThemeColors so it follows the active palette.
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    ...shadows.level1,
  },
  bar: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    maxWidth: 560,
    minHeight: BAR_MIN_HEIGHT,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    gap: 4,
  },
  tabActive: {
    // Background is supplied inline from useThemeColors so it follows the active palette.
    backgroundColor: "transparent",
  },
  tabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
  },
  labelActive: {
    fontWeight: "700",
  },
  fabSlot: {
    width: SHELL_FAB_SLOT_WIDTH,
  },
  fab: {
    position: "absolute",
    bottom: Math.max(28, SHELL_TAB_BAR_MIN_HEIGHT - 24),
    left: "50%",
    marginLeft: -SHELL_FAB_SIZE / 2,
    width: SHELL_FAB_SIZE,
    height: SHELL_FAB_SIZE,
    borderRadius: SHELL_FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    // Ring follows the active palette; the static fallback is declared inline above.
    ...shadows.level2,
  },
  fabPressed: {
    transform: [{ scale: 0.97 }],
  },
});


