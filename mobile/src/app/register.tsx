import React, { useState } from "react";
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
  ScrollView,
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
 * Phase 1 — Lawyer self-service registration.
 *
 * Posts to the EXISTING /api/auth/register endpoint with role=lawyer.
 * Server-side `resolveSelfServiceRole` allows "lawyer" in the allowlist
 * and forcibly downgrades anything else — this form simply requests the
 * lawyer role; the server is the authority.
 */
export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (busy) return;
    if (!name.trim() || !email.trim() || !password || !state.trim() || !city.trim()) {
      setError("Name, email, password, state and city are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/register`, {
        name: name.trim(),
        fullName: name.trim(),
        email: email.trim(),
        password,
        role: "lawyer",
        state: state.trim(),
        city: city.trim(),
        specialization,
      });
      if (!data?.token || !data?.user) throw new Error("Missing token in register response");

      await AsyncStorage.multiSet([
        [TOKEN_KEY, data.token],
        [REFRESH_KEY, data.refreshToken || ""],
      ]);

      router.replace("/courtdesk");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Registration failed");
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.box}>
          <Text style={styles.eyebrow}>LAWYER2LAWYER</Text>
          <Text style={styles.title}>Create a lawyer account</Text>
          <Text style={styles.subtitle}>
            Registration mints a lawyer profile; case assignment comes from the admin desk.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={TEXT_MUTED}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />
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
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 8 chars)"
            placeholderTextColor={TEXT_MUTED}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor={TEXT_MUTED}
            value={state}
            onChangeText={setState}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor={TEXT_MUTED}
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Specialization (optional)"
            placeholderTextColor={TEXT_MUTED}
            value={specialization}
            onChangeText={setSpecialization}
            autoCapitalize="words"
            returnKeyType="done"
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.submitBtn, busy && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Create lawyer account"
          >
            {busy ? <ActivityIndicator color={NAVY_BG} /> : <Text style={styles.submitText}>Create account</Text>}
          </Pressable>

          <Pressable
            onPress={() => router.replace("/lawyer-login")}
            accessibilityRole="button"
            accessibilityLabel="Already have an account, sign in"
          >
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NAVY_BG },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  box: {
    backgroundColor: "#101D31",
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1D2B44",
  },
  eyebrow: { color: GOLD, fontSize: 12, letterSpacing: 2, fontWeight: "700" },
  title: { color: TEXT_LIGHT, fontSize: 24, fontWeight: "800", marginTop: 6 },
  subtitle: { color: TEXT_MUTED, fontSize: 12, marginBottom: 18, marginTop: 4 },
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