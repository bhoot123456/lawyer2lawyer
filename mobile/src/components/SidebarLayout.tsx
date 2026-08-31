import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { usePathname } from "expo-router";
import Sidebar from "@/components/Sidebar";
import AuthGate from "@/components/AuthGate";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const pathname = usePathname();


  const headerTitle = useMemo(() => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/court-diary":
        return "Court Diary";
      case "/cases":
        return "Cases";
      case "/bare-acts":
        return "Bare Acts";
      case "/criminal-law":
        return "Criminal Law";
      case "/misc-forms":
        return "Misc. Forms";
      case "/supreme-court":
        return "Supreme Court";
      case "/tribunals":
        return "Tribunals";
      case "/delhi-courts":
        return "Delhi Courts";
      case "/cases/[id]":
        return "Case";

      case "/cases/new":
        return "New Case";
      case "/cases/[id]/edit":
        return "Edit Case";

      case "/tax-corporate":
        return "Tax & Corporate";
      case "/tax-corporate/[key]":
        return "Tax Topic";

      case "/professionals":
        return "Professionals";

      case "/ai-assistant":
        return "AI Legal Assistant";
      case "/ai-draft-legal-notice":
        return "Draft Legal Notice";
      case "/ai-summarize-judgment":
        return "Summarize Judgment";
      case "/ai-explain-bare-act":
        return "Explain Bare Act";
      case "/ai-case-summary":
        return "Case Summary";
      case "/ai-find-lawyers":
        return "Lawyer Assistant";
      case "/ai-search-documents":
        return "Search Documents";
      case "/ai-legal-checklist":
        return "Legal Checklist";
      case "/ai-history":
        return "AI History";

      default:
        return "Lawyer2Lawyer";

    }
  }, [pathname]);

  return (
    <View style={styles.container}>
      {sidebarVisible && (
        <>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setSidebarVisible(false)}
          />
          <View style={styles.sidebarWrapper}>
            <Sidebar onClose={() => setSidebarVisible(false)} />
          </View>
        </>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setSidebarVisible((v) => !v)}
              style={styles.hamburgerButton}
            >
              <Text style={styles.hamburgerIcon}>≡</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>
              {headerTitle}
            </Text>

            {/* quick exit for mobile UX */}
            {/* <TouchableOpacity
              onPress={() => {
                if (sidebarVisible) setSidebarVisible(false);
                router.push("/" as any);
              }}
              style={styles.homeButton}
            >
              <Text style={styles.homeButtonText}>Home</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        <AuthGate>{children}</AuthGate>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(20, 20, 22, 0.85)",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.goldLight,
    ...shadows.level1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    backgroundColor: "rgba(20, 20, 22, 0.7)",
    borderWidth: 1,
    borderColor: colors.border.goldLight,
  },
  hamburgerIcon: {
    color: colors.accent.gold,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 22,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
    textAlign: "left",
    flex: 1,
  },
  homeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    backgroundColor: "rgba(20, 20, 22, 0.7)",
  },
  homeButtonText: {
    color: colors.accent.gold,
    fontWeight: "700",
    fontSize: typography.body.fontSize,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    justifyContent: "flex-start",
    alignItems: "stretch",
    paddingHorizontal: 0,
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
