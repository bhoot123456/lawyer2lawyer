import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { usePathname, router } from "expo-router";
import { getAuthToken } from "@/services/api";

function decodeBase64(str: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let input = String(str).replace(/-/g, "+").replace(/_/g, "/");
  while (input.length % 4) input += "=";
  for (let bc = 0, bs = 0, buffer, idx = 0; (buffer = input.charAt(idx++)); ) {
    const bIndex = chars.indexOf(buffer);
    if (~bIndex) {
      bs = bc % 4 ? bs * 64 + bIndex : bIndex;
      if (bc++ % 4) {
        output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
      }
    }
  }
  return output;
}

function decodeRole(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(decodeBase64(parts[1]));
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

/**
 * Route-level auth gate (Phase 1).
 *
 * - /admin/*     requires a token with role=admin
 * - /courtdesk/* requires a token with role=lawyer
 * - everything else is public
 *
 * This is a UX/route-level guard; the backend middleware
 * (adminAuth / lawyerAuth) remains the authoritative enforcement.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const routeKind = useMemo(() => {
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/courtdesk")) return "lawyer";
    return "public";
  }, [pathname]);
  const isProtected = routeKind !== "public";

  const [checking, setChecking] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!isProtected) {
        setChecking(false);
        setAuthed(true);
        return;
      }

      try {
        setChecking(true);
        const token = await getAuthToken();
        const role = decodeRole(token);
        const ok = routeKind === "admin" ? role === "admin" : role === "lawyer";
        if (!mounted) return;

        setAuthed(ok);

        if (!ok) {
          router.replace((routeKind === "admin" ? "/login" : "/lawyer-login") as any);
        }
      } finally {
        if (mounted) setChecking(false);
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, [isProtected, routeKind, pathname]);

  if (!isProtected) return <>{children}</>;

  if (checking || authed === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Checking access...</Text>
      </View>
    );
  }

  if (!authed) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please login first</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
});