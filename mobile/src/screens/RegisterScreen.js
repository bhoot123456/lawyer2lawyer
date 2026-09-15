import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";

import Navbar from "@/components/Navbar";
import { coverageStates } from "@/constants/coverage";
import { colors } from "@/theme/designSystem";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state] = useState("Uttar Pradesh");
  const [city] = useState("Noida");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  console.log(coverageStates);

  return (
    <View style={styles.container}>
      <Navbar title="Register" />
      <View style={styles.body}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#999"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
        />

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

              const { register, setAuthToken } = await import("@/services/api");

              const { token } = await register({
                name,
                email,
                password,
                role: "client",
                state,
                city,
              });

              await setAuthToken(token);
              navigation.replace("Dashboard");
            } catch (e) {
               
              console.log("Register failed", e);
              const serverMessage = e?.response?.data?.message;
              setError(serverMessage || "Unable to register");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Creating..." : "Create account"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={styles.link}
        >
          <Text style={styles.linkText}>Already have an account?</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  body: {
    flex: 1,
    padding: 16,
    gap: 12,
    justifyContent: "center",
    backgroundColor: colors.bg.primary,
  },
  title: { fontSize: 26, fontWeight: "900", color: "#FFFFFF" },
  input: {
    borderWidth: 1,
    borderColor: "#2E3135",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#161616",
    color: "#FFFFFF",
  },
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: {
    borderWidth: 1,
    borderColor: "#2E3135",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#161616",
  },
  chipSelected: {
    backgroundColor: "#208AEF",
    borderColor: "#208AEF",
  },
  chipText: { color: "#FFFFFF", fontWeight: "900" },
  chipTextSelected: { color: "#fff" },
  errorText: { color: "#FF6666", fontWeight: "800" },
  button: {
    backgroundColor: "#208AEF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1877D6",
  },
  buttonText: { color: "#fff", fontWeight: "900" },
  link: { marginTop: 6 },
  linkText: { color: "#208AEF", fontWeight: "900" },
});
