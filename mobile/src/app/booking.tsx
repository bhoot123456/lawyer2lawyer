import React from "react";
import { router } from "expo-router";

// Booking system removed (client no longer requires booking).
// Keep this file to avoid breaking older deep-links.
export default function BookingRedirect() {
  router.replace("/delhi-courts" as any);
  return null;
}

