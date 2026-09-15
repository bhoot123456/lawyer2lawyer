import { Platform } from "react-native";

// Premium legal-tech palette — navy slate surfaces with legal-gold accent.
const darkColors = {
  bg: {
    primary: "#0F172A",
    surface: "#162033",
    elevated: "#1B2638",
    overlay: "#22304A",
  },
  border: {
    subtle: "rgba(148,163,184,0.08)",
    default: "rgba(148,163,184,0.16)",
    strong: "rgba(148,163,184,0.26)",
    gold: "rgba(212,175,55,0.25)",
    goldLight: "rgba(212,175,55,0.12)",
  },
  text: {
    primary: "#F8FAFC",
    secondary: "#94A3B8",
    muted: "#64748B",
    inverse: "#0F172A",
  },
  accent: {
    gold: "#D4AF37",
    goldDark: "#B8942A",
    goldLight: "rgba(212,175,55,0.15)",
    goldSubtle: "rgba(212,175,55,0.08)",
  },
  semantic: {
    success: "#22C55E",
    successSubtle: "rgba(34,197,94,0.12)",
    warning: "#EAB308",
    warningSubtle: "rgba(234,179,8,0.12)",
    danger: "#EF4444",
    dangerSubtle: "rgba(239,68,68,0.12)",
    info: "#60A5FA",
    infoSubtle: "rgba(96,165,250,0.12)",
  },
} as const;

const lightColors = {
  bg: {
    primary: "#FFFFFF",
    surface: "#F8FAFC",
    elevated: "#F1F5F9",
    overlay: "#E2E8F0",
  },
  border: {
    subtle: "rgba(0,0,0,0.06)",
    default: "rgba(0,0,0,0.10)",
    strong: "rgba(0,0,0,0.16)",
    gold: "rgba(184,148,42,0.30)",
    goldLight: "rgba(184,148,42,0.12)",
  },
  text: {
    primary: "#0F172A",
    secondary: "#475569",
    muted: "#64748B",
    inverse: "#FFFFFF",
  },
  accent: {
    gold: "#B8942A",
    goldDark: "#9A7B22",
    goldLight: "rgba(184,148,42,0.12)",
    goldSubtle: "rgba(184,148,42,0.06)",
  },
  semantic: {
    success: "#16A34A",
    successSubtle: "rgba(22,163,74,0.10)",
    warning: "#CA8A04",
    warningSubtle: "rgba(202,138,4,0.10)",
    danger: "#DC2626",
    dangerSubtle: "rgba(220,38,38,0.10)",
    info: "#2563EB",
    infoSubtle: "rgba(37,99,235,0.10)",
  },
} as const;

/** Active color palette (dark by default). Components using the useThemeColors hook will get the mode-appropriate palette. */
export const colors = darkColors;

export type ColorPalette = {
  bg: { primary: string; surface: string; elevated: string; overlay: string };
  border: { subtle: string; default: string; strong: string; gold: string; goldLight: string };
  text: { primary: string; secondary: string; muted: string; inverse: string };
  accent: { gold: string; goldDark: string; goldLight: string; goldSubtle: string };
  semantic: { success: string; successSubtle: string; warning: string; warningSubtle: string; danger: string; dangerSubtle: string; info: string; infoSubtle: string };
};

export const lightColorsPalette: ColorPalette = lightColors;
export const darkColorsPalette: ColorPalette = darkColors;

export const radii = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const typography = {
  display: {
    fontSize: 32,
    fontWeight: "800" as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 24,
    fontWeight: "800" as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 20,
    fontWeight: "700" as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 18,
    fontWeight: "700" as const,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodySemibold: {
    fontSize: 15,
    fontWeight: "600" as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 12,
    fontWeight: "700" as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  overline: {
    fontSize: 10,
    fontWeight: "700" as const,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  legal: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  button: {
    fontSize: 14,
    fontWeight: "700" as const,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
} as const;

export const shadows = {
  level0: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    boxShadow: "none" as const,
  },
  level1: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
    boxShadow: "0px 2px 8px rgba(0,0,0,0.15)" as const,
  },
  level2: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    boxShadow: "0px 4px 12px rgba(0,0,0,0.2)" as const,
  },
  level3: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    boxShadow: "0px 8px 20px rgba(0,0,0,0.25)" as const,
  },
  level4: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 12,
    boxShadow: "0px 12px 28px rgba(0,0,0,0.3)" as const,
  },
} as const;

export const fontFamilies = {
  sans: Platform.select({
    ios: "system-ui",
    android: "Roboto",
    web: "Inter, system-ui, -apple-system, sans-serif",
    default: "system-ui",
  }),
  mono: Platform.select({
    ios: "ui-monospace",
    android: "monospace",
    web: "ui-monospace, SFMono-Regular, Menlo, monospace",
    default: "monospace",
  }),
} as const;

/**
 * PHASE 1 semantic aliases — additive only, no existing token renamed/removed.
 * Prefer these in new/updated UI so intent is explicit:
 * background/surface/elevated, textPrimary/textSecondary/textMuted,
 * border, primary/primaryPressed, success/warning/danger/disabled.
 */
export const semantic = {
  background: colors.bg.primary,
  surface: colors.bg.surface,
  elevated: colors.bg.elevated,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  textMuted: colors.text.muted,
  border: colors.border.default,
  primary: colors.accent.gold,
  primaryPressed: colors.accent.goldDark,
  success: colors.semantic.success,
  warning: colors.semantic.warning,
  danger: colors.semantic.danger,
  disabled: colors.text.muted,
} as const;

/** Canonical max content width for centered legal/readable layouts. */
export const layout = {
  maxContentWidth: 800,
} as const;

/** Restrained motion scale: 150–300ms interaction feedback. */
export const motion = {
  fastest: 150,
  fast: 200,
  normal: 250,
  slow: 300,
} as const;
