import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from "react-native";
import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "@/components/Sidebar";
import AuthGate from "@/components/AuthGate";
import { radii, spacing, typography } from "@/theme/designSystem";
import { useThemeColors } from "@/theme/ThemeProvider";

/**
 * PHASE 2 shell header: quiet full-width divider, restrained gold.
 * Route titles intentionally have no subtitle/fabricated metadata.
 */

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  // Android back button: close sidebar if open
  useEffect(() => {
    if (!sidebarVisible) return;
    const backSub = BackHandler.addEventListener("hardwareBackPress", () => {
      setSidebarVisible(false);
      return true;
    });
    return () => backSub.remove();
  }, [sidebarVisible]);

  const isHeaderHidden = useMemo(() => {
    return pathname.startsWith("/admin") || pathname === "/login";
  }, [pathname]);

  const headerTitle = useMemo(() => {
    if (pathname.startsWith("/cases")) {
      if (pathname === "/cases/new") return "New Case";
      if (pathname.endsWith("/edit")) return "Edit Case";
      if (pathname.endsWith("/timeline")) return "Case Timeline";
      if (pathname.endsWith("/documents")) return "Case Documents";
      if (pathname.endsWith("/notes")) return "Case Notes";
      if (pathname.endsWith("/expenses")) return "Case Expenses";
      if (pathname === "/cases") return "Cases";
      return "Case Details";
    }

    if (pathname.startsWith("/supreme-court-vc-links")) return "Supreme Court VC";
    if (pathname.startsWith("/supreme-court")) return "Supreme Court";
    if (pathname.startsWith("/delhi-district-courts")) return "District Courts";
    if (pathname.startsWith("/delhi-courts")) return "Delhi Courts";
    if (pathname.startsWith("/knowledge-hub")) return "Knowledge Hub";
    if (pathname.startsWith("/draft-library")) return "Draft Library";
    if (pathname.startsWith("/revenue-court")) return "Revenue Court";
    if (pathname.startsWith("/tax-corporate")) return "Tax & Corporate";
    if (pathname.startsWith("/criminal-law")) return "Criminal Law";
    if (pathname.startsWith("/bare-acts")) return "Bare Acts";
    if (pathname.startsWith("/court-diary")) return "Court Diary";
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/misc-forms")) return "Misc. Forms";
    if (pathname.startsWith("/professionals")) return "Professionals";
    if (pathname.startsWith("/tribunals")) return "Tribunals";

    if (pathname === "/ai-assistant") return "AI Legal Assistant";
    if (pathname === "/ai-draft-legal-notice") return "Draft Legal Notice";
    if (pathname === "/ai-summarize-judgment") return "Summarize Judgment";
    if (pathname === "/ai-explain-bare-act") return "Explain Bare Act";
    if (pathname === "/ai-case-summary") return "Case Summary";
    if (pathname === "/ai-find-lawyers") return "Lawyer Assistant";
    if (pathname === "/ai-search-documents") return "Search Documents";
    if (pathname === "/ai-legal-checklist") return "Legal Checklist";
    if (pathname === "/ai-history") return "AI History";

    if (pathname === "/") return "Lawyer2Lawyer";
    return "Lawyer2Lawyer";
  }, [pathname]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
      {sidebarVisible && (
        <>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            accessibilityRole="button"
            accessibilityLabel="Close navigation menu"
            onPress={() => setSidebarVisible(false)}
          />
          <View style={styles.sidebarWrapper}>
            <Sidebar onClose={() => setSidebarVisible(false)} />
          </View>
        </>
      )}

      <View style={[styles.content, { backgroundColor: colors.bg.primary }]}>
        {!isHeaderHidden && (
          <View
            style={[
              styles.header,
              {
                paddingTop: insets.top + spacing.sm,
                backgroundColor: colors.bg.primary,
                borderBottomColor: colors.border.subtle,
              },
            ]}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Open Navigation Menu"
                accessibilityHint="Opens the app navigation menu"
                hitSlop={8}
                onPress={() => setSidebarVisible((v) => !v)}
                style={[styles.hamburgerButton, { borderColor: colors.border.default }]}
              >
                <Text style={[styles.hamburgerIcon, { color: colors.text.secondary }]}>≡</Text>
              </TouchableOpacity>

              <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>
                {headerTitle}
              </Text>
            </View>
          </View>
        )}

        <AuthGate>{children}</AuthGate>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
    hamburgerButton: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    borderWidth: 1,
  },
  hamburgerIcon: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 22,
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
    textAlign: "left",
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    paddingHorizontal: 0,
    paddingBottom: 0,
    position: "relative",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    zIndex: 99,
  },
  sidebarWrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 260,
    zIndex: 100,
  },
});
