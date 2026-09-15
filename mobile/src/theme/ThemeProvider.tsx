/**
 * ThemeProvider — provides light/dark/system mode context.
 * Wrap your app root with <ThemeProvider> to enable mode switching.
 * Components use useThemeColors() to get the active color palette.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  ColorPalette,
  darkColorsPalette,
  lightColorsPalette,
} from "./designSystem";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ColorPalette;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "@lawyer2lawyer/theme_mode";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
};

export function ThemeProvider({
  children,
  defaultMode = "dark",
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [loaded, setLoaded] = useState(false);

  // Load persisted mode on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: AsyncStorage } = await import(
          "@react-native-async-storage/async-storage"
        );
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && stored && (stored === "light" || stored === "dark" || stored === "system")) {
          setModeState(stored as ThemeMode);
        }
      } catch {
        // ignore — fall back to defaultMode
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    // Fire-and-forget persistence
    import("@react-native-async-storage/async-storage")
      .then(({ default: AsyncStorage }) =>
        AsyncStorage.setItem(STORAGE_KEY, next),
      )
      .catch(() => {
        // ignore persistence errors
      });
  }, []);

  const isDark = useMemo(() => {
    if (mode === "system") {
      return systemScheme === "dark" || systemScheme === "unspecified";
    }
    return mode === "dark";
  }, [mode, systemScheme]);

  const colors = isDark ? darkColorsPalette : lightColorsPalette;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, colors, isDark }),
    [mode, setMode, colors, isDark],
  );

  // Avoid flash of wrong theme
  if (!loaded && defaultMode === "system") {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Access the active theme context (mode, colors, setMode). */
export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within a <ThemeProvider>");
  }
  return ctx;
}

/** Get the active color palette (respects light/dark/system mode). */
export function useThemeColors(): ColorPalette {
  return useThemeContext().colors;
}

/** Convenience: toggle between light and dark modes. */
export function useThemeToggle() {
  const { mode, setMode, isDark } = useThemeContext();
  const toggle = useCallback(() => {
    setMode(isDark ? "light" : "dark");
  }, [isDark, setMode]);
  return { mode, setMode, isDark, toggle };
}