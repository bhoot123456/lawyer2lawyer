import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { logout, isAuthenticated, getAuthToken } from "@/services/api";
import { colors, radii, shadows, spacing, typography } from "@/theme/designSystem";

function blurActiveElement() {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}

// Decode JWT payload to check if the user is an admin
function isAdminToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    return payload?.role === "admin";
  } catch {
    return false;
  }
}

const NAV_ITEMS_PUBLIC = [
  { label: "Supreme Court", route: "/supreme-court", icon: "scale-outline" },
  { label: "Delhi Courts", route: "/delhi-courts", icon: "location-outline" },
  { label: "Bare Acts", route: "/bare-acts", icon: "book-outline" },
  { label: "Criminal Law", route: "/criminal-law", icon: "shield-checkmark-outline" },
  { label: "Misc. Forms", route: "/misc-forms", icon: "document-text-outline" },
  { label: "Tribunals", route: "/tribunals", icon: "business-outline" },
  { label: "Revenue Court (Phase 8)", route: "/revenue-court", icon: "book-outline" },
  { label: "Tax & Corporate (Phase 9)", route: "/tax-corporate", icon: "briefcase-outline" },
  { label: "Knowledge Hub (Phase 10)", route: "/knowledge-hub", icon: "library-outline" },
  { label: "Professionals", route: "/professionals", icon: "people-outline" },
  { label: "Cases", route: "/cases", icon: "briefcase-outline" },
];

const NAV_ITEMS_ADMIN = [
  // ======================
  // Admin
  // ======================
  { label: "Admin Dashboard", route: "/admin", icon: "settings-outline" },
  { label: "Admin Bare Acts", route: "/admin/bare-acts", icon: "book-outline" },
  { label: "Admin Revenue (Phase 8)", route: "/admin/revenue-court-phase8", icon: "briefcase-outline" },
  { label: "Admin Tax (Phase 9)", route: "/admin/tax-corporate-phase9", icon: "briefcase-outline" },
  { label: "Admin Reports", route: "/admin/reports", icon: "document-text-outline" },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();

  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await getAuthToken();
      if (mounted) setIsAdmin(!!token && isAdminToken(token));
    })();
    return () => {
      mounted = false;
    };
  }, []);


  const handlePress = (route) => {
    if (onClose) onClose();
    blurActiveElement();
    router.push(route);
  };

  // Build nav items: public items always visible, admin items only if admin
  const navItems = [
    ...NAV_ITEMS_PUBLIC,
    ...(isAdmin ? NAV_ITEMS_ADMIN : []),
    { label: isAdmin ? "Logout" : "Admin Login", route: isAdmin ? "" : "/login", icon: isAdmin ? "log-out-outline" : "log-in-outline" },
  ];

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>Lawyer2Lawyer</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close-outline" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.menu}>
        {navItems.map((item) => {

          const isActive = pathname === item.route;
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, isActive ? styles.menuItemActive : null]}
              onPress={async () => {
                if (item.label === "Logout") {
                  await logout();
                  if (onClose) onClose();
                  blurActiveElement();
                  router.replace("/login");
                  return;
                }
                handlePress(item.route);
              }}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? colors.accent.gold : colors.text.muted}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuItemText, isActive ? styles.menuItemTextActive : null]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Professional Legal Portal</Text>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    backgroundColor: "rgba(20, 20, 22, 0.95)",
    borderRightWidth: 1,
    borderRightColor: colors.border.goldLight,
    paddingTop: 44, // Safe area padding
    paddingBottom: 24,
    paddingHorizontal: 16,
    ...shadows.level3,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  brand: {
    color: colors.accent.gold,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    letterSpacing: 0.5,
  },

  closeBtn: {
    padding: 4,
  },
  menu: {
    gap: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radii.lg,
    position: "relative",
  },
  menuItemActive: {
    backgroundColor: colors.accent.goldSubtle,
  },

  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
  },
  menuItemTextActive: {
    color: colors.text.primary,
    fontWeight: "800",
  },

  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 4,
    backgroundColor: colors.accent.gold,
    borderRadius: 2,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.goldLight,
  },

  footerText: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
  },

  versionText: {
    color: colors.text.muted,
    fontSize: typography.overline.fontSize,
    marginTop: 4,
  },
});