// Centralized UI tokens (used by screens/components that want consistent styling)
import { colors, radii, spacing, typography, semantic, layout, motion } from "@/theme/designSystem";

export const APP_BG = colors.bg.primary;
export const APP_SURFACE = colors.bg.surface;
export const APP_SURFACE_2 = colors.bg.elevated;
export const APP_BORDER = colors.border.subtle;
export const APP_TEXT = colors.text.primary;
export const APP_TEXT_MUTED = colors.text.secondary;
export const APP_ACCENT = colors.accent.gold;
export const APP_ACCENT_DARK = colors.accent.goldDark;
export const APP_LINK = colors.semantic.info;

export { typography, colors, radii, spacing, semantic, layout, motion };

// Re-export theme context utilities (canonical)
export {
  ThemeProvider,
  useThemeContext,
  useThemeColors,
  useThemeToggle,
} from "@/theme/ThemeProvider";
export type { ThemeMode } from "@/theme/ThemeProvider";