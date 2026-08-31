import { Platform } from "react-native";

export const colors = {
  bg: {
    primary: "#0B0B0B",
    surface: "#141416",
    elevated: "#1A1A1C",
    overlay: "#212124",
  },
  border: {
    subtle: "rgba(255,255,255,0.06)",
    default: "rgba(255,255,255,0.10)",
    strong: "rgba(255,255,255,0.16)",
    gold: "rgba(212,175,55,0.25)",
    goldLight: "rgba(212,175,55,0.12)",
  },
  text: {
    primary: "#F8FAFC",
    secondary: "#B0B4BA",
    muted: "#94A3B8",
    inverse: "#0B0B0B",
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
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  overline: {
    fontSize: 10,
    fontWeight: "700" as const,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
} as const;

export const shadows = {
  level0: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  level2: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  level3: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  level4: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 12,
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
