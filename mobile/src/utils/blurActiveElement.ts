import { Platform } from "react-native";

/**
 * Blurs the currently focused element on Web platform only.
 * This prevents Chrome DevTools accessibility warning:
 * "Don't hide focused elements with aria-hidden. Use inert or move focus elsewhere before hiding."
 *
 * Call this before any router.push/replace/back/navigate to ensure the
 * active element loses focus before React Navigation applies aria-hidden
 * to the previous screen (via react-native-screens on Web).
 */
export function blurActiveElement(): void {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
