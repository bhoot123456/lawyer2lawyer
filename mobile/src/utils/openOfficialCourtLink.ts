import { Alert, Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { blurActiveElement } from "./blurActiveElement";

const CURRENT_ROSTER_URL =
  "https://delhihighcourt.nic.in/web/judges-roster";

/**
 * Opens an official court URL in the Expo in-app browser.
 *
 * - Calls blurActiveElement() before opening.
 * - Attempts WebBrowser.openBrowserAsync() first (Expo in-app browser).
 * - Falls back to Linking.openURL() (system browser) if the in-app browser fails.
 * - Shows an Alert only if every attempt fails.
 *
 * @param url    - The official court URL to open.
 * @param title  - Optional display title used in the fallback Alert message (defaults to "Open Court Link").
 */
export async function openOfficialCourtLink(
  url: string,
  title: string = "Open Court Link",
): Promise<void> {
  blurActiveElement();

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(
        "Unable to Open",
        `${title} is currently unavailable. Please try again later.`,
      );
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      // In-app browser failed; fall back to system browser.
      await Linking.openURL(url);
    }
  } catch {
    Alert.alert(
      "Unable to Open",
      `${title} is currently unavailable. Please try again later.`,
    );
  }
}

/**
 * Opens the official Delhi High Court Current Roster page
 * in the Expo in-app browser (with system browser fallback).
 *
 * URL: https://delhihighcourt.nic.in/web/judges-roster
 */
export async function openCurrentRoster(): Promise<void> {
  await openOfficialCourtLink(CURRENT_ROSTER_URL, "Current Roster");
}

/**
 * Opens the official Delhi High Court Case History page
 * in the Expo in-app browser (with system browser fallback).
 *
 * URL: https://delhihighcourt.nic.in/app/get-case-wise
 */
export async function openCaseHistory(): Promise<void> {
  await openOfficialCourtLink(
    "https://delhihighcourt.nic.in/app/get-case-wise",
    "Delhi High Court Case History",
  );
}

/**
 * Opens the official Delhi High Court Orders portal
 * in the Expo in-app browser (with system browser fallback).
 *
 * URL: https://delhihighcourt.nic.in/app/
 */
export async function openOrders(): Promise<void> {
  await openOfficialCourtLink(
    "https://delhihighcourt.nic.in/app/",
    "Delhi High Court Orders",
  );
}

/**
 * Opens the official Delhi High Court Judgment Information System
 * in the Expo in-app browser (with system browser fallback).
 *
 * URL: https://delhihighcourt.nic.in/app/case-number
 */
export async function openJudgments(): Promise<void> {
  await openOfficialCourtLink(
    "https://delhihighcourt.nic.in/app/case-number",
    "Delhi High Court Judgment Information System",
  );
}

