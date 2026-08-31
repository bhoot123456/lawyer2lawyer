import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";

import Navbar from "@/components/Navbar";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  return (
    <View style={styles.container}>
      <Navbar title="Admin Login" />
      <View style={styles.body}>
        <Text style={styles.title}>Admin Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.button, submitting ? { opacity: 0.7 } : null]}
          disabled={submitting}
          onPress={async () => {
            try {
              setSubmitting(true);
              setError(null);

              const { login, persistTokens } = await import("@/services/api");
              const { token, refreshToken, user } = await login({ email, password });

              if (user?.role !== "admin") {
                setError("You are not authorized to access the Admin Panel.");
                return;
              }

              await persistTokens({ token, refreshToken });
              navigation.replace("Dashboard");
            } catch (e) {
              console.log("Login failed", e);
              setError("Unable to login");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Signing in..." : "Admin Login"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  body: {
    flex: 1,
    padding: 16,
    gap: 12,
    justifyContent: "center",
    backgroundColor: "#0B0B0B",
  },
  title: { fontSize: 26, fontWeight: "900", color: "#FFFFFF", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#2E3135",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#161616",
    color: "#FFFFFF",
  },
  errorText: { color: "#FF6666", fontWeight: "700" },
  button: {
    backgroundColor: "#208AEF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1877D6",
  },
  buttonText: { color: "#fff", fontWeight: "900" },
});
