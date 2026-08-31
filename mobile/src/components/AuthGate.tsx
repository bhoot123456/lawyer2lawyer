import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { usePathname, router } from "expo-router";
import { getAuthToken } from "@/services/api";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdminRoute = useMemo(() => {
    // Only protect /admin/* routes
    return pathname.startsWith("/admin");
  }, [pathname]);

  const [checking, setChecking] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!isAdminRoute) {
        // Allow all non-admin routes without authentication
        setChecking(false);
        setAuthed(true);
        return;
      }

      try {
        setChecking(true);
        const token = await getAuthToken();
        const ok = !!token;
        if (!mounted) return;

        setAuthed(ok);

        if (!ok) {
          router.replace("/login" as any);
        }
      } finally {
        if (mounted) setChecking(false);
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, [isAdminRoute, pathname]);

  if (!isAdminRoute) return <>{children}</>;

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
    backgroundColor: "#0B0B0B",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
});


