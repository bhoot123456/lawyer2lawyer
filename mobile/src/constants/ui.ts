// DEPRECATED: prefer "@/theme/designSystem" + useThemeColors() from "@/theme/ThemeProvider".
// This file remains only for backward compatibility (UI.* usages) — do not add new tokens here.
﻿import { colors } from "@/theme/designSystem";
export const UI = {
  brand: {
    primary: "#D4AF37", // gold
    primaryDark: colors.accent.gold,
  },
  colors: {
    bg: colors.bg.primary,
    surface: "#161616",
    surface2: "#0F0F0F",
    panel: "#161616",
    border: "#2E3135",
    text: "#FFFFFF",
    textSecondary: "#B0B4BA",
    muted: "#999999",
    error: "#FF6666",
    link: "#208AEF",
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 999,
  },
  shadow: {
    // RN web/ios safe approximations
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 3,
      boxShadow: "0px 2px 6px rgba(0,0,0,0.18)" as const,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 14,
      elevation: 6,
      boxShadow: "0px 6px 14px rgba(0,0,0,0.22)" as const,
    },
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
};
