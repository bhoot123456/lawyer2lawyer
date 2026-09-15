import React, { useState, useRef } from "react";
import { colors } from "@/theme/designSystem";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE =
  (globalThis as any).process?.env?.EXPO_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
const NAVY_BG = colors.bg.primary;
const GOLD = colors.accent.gold;
const TEXT_LIGHT = "#F2F5F9";
const TEXT_MUTED = "#93A3BC";
const INPUT_BG = "#101D31";
const TOKEN_KEY = "@auth_token";
const REFRESH_KEY = "@auth_refresh_token";

/**
 * Phase 1 lawyer login UX.
 *
 * Reuses the EXISTING /api/auth/login endpoint (no new auth code).
 * On success routes by role:
 *   - lawyer -> /courtdesk
 *   - admin  -> existing admin desk (/admin)
 *   - other  -> root shell (/)
 *
 * Server-side RBAC (middleware/lawyerAuth) is the real guard; this screen
 * only routes the user to the right part of the app.
 */
export default function LawyerLoginScreen() {
  const router = useRouter();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/login`, {
        email: email.trim(),
        password,
      });
      if (!data?.token || !data?.user) throw new Error("Missing token in login response");

      await AsyncStorage.multiSet([
        [TOKEN_KEY, data.token],
        [REFRESH_KEY, data.refreshToken || ""],
      ]);

      const role = data.user.role;
      if (role === "lawyer") router.replace("/courtdesk");
      else if (role === "admin") router.replace("/admin");
      else router.replace("/");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Login failed");
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={styles.box}>
        <Text style={styles.eyebrow}>LAWYER2LAWYER</Text>
        <Text style={styles.title}>CourtDesk sign in</Text>
        <Text style={styles.subtitle}>Lawyer workspaces will be provisioned here.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={TEXT_MUTED}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          blurOnSubmit={false}
          ref={emailInputRef}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={TEXT_MUTED}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          blurOnSubmit={false}
          ref={passwordInputRef}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.submitBtn, busy && { opacity: 0.6 }]}
          onPress={onSubmit}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Sign in to CourtDesk"
        >
          {busy ? <ActivityIndicator color={NAVY_BG} /> : <Text style={styles.submitText}>Sign in</Text>}
        </Pressable>

        <Pressable
          onPress={() => router.push("/register")}
          accessibilityRole="button"
          accessibilityLabel="Create a new lawyer account"
        >
          <Text style={styles.link}>New lawyer? Create an account</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/")}
          accessibilityRole="button"
          accessibilityLabel="Back to the main app"
        >
          <Text style={styles.link}>Back to the app</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NAVY_BG, justifyContent: "center", padding: 24 },
  box: {
    backgroundColor: "#101D31",
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1D2B44",
  },
  eyebrow: { color: GOLD, fontSize: 12, letterSpacing: 2, fontWeight: "700" },
  title: { color: TEXT_LIGHT, fontSize: 24, fontWeight: "800", marginTop: 6 },
  subtitle: { color: TEXT_MUTED, fontSize: 12, marginBottom: 20, marginTop: 4 },
  input: {
    backgroundColor: INPUT_BG,
    borderColor: "#23324C",
    borderWidth: 1,
    borderRadius: 10,
    color: TEXT_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    fontSize: 15,
  },
  error: { color: "#F0A3A3", marginTop: 10, fontSize: 13 },
  submitBtn: {
    backgroundColor: GOLD,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 18,
  },
  submitText: { color: colors.bg.primary, fontWeight: "800", fontSize: 15 },
  link: { color: GOLD, textAlign: "center", marginTop: 16, fontSize: 14 },
});