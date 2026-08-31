import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";

import { blurActiveElement } from "@/utils/blurActiveElement";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <KeyboardAwareView
      style={styles.container}
      contentContainerStyle={styles.innerContainer}
    >
      <Text style={styles.logo}>Lawyer2Lawyer</Text>

      <Text style={styles.heading}>Admin Login</Text>
      <Text style={styles.subHeading}>Sign in to access the Admin Panel</Text>

      <View style={styles.inputBox}>
        <Ionicons name="mail-outline" size={20} color="#B58D3D" style={styles.inputIcon} />
        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputBox}>
        <Ionicons name="lock-closed-outline" size={20} color="#B58D3D" style={styles.inputIcon} />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          secureTextEntry={hidePassword}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons
            name={hidePassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        activeOpacity={0.8}
          onPress={async () => {
          try {
          const { login, persistTokens } = await import("@/services/api");

            const { token, refreshToken, user } = await login({ email, password });

            if (user?.role !== "admin") {
              alert("You are not authorized to access the Admin Panel.");
              return;
            }

            await persistTokens({ token, refreshToken });
            blurActiveElement();
            router.replace("/admin" as any);
          } catch (e: any) {
            const serverMessage = e?.response?.data?.message;
            const msg = serverMessage || e?.message || "Login failed";
            alert(msg);
          }
        }}
      >
        <Text style={styles.loginText}>Admin Login</Text>
      </TouchableOpacity>
    </KeyboardAwareView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    justifyContent: "center",
    padding: 24,
  },
  innerContainer: {
    justifyContent: "center",
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#B58D3D",
    textAlign: "center",
    marginBottom: 48,
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1E293B",
    letterSpacing: 0.3,
  },
  subHeading: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
    marginBottom: 32,
    fontWeight: "500",
  },
  inputBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAE5DB",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#1E293B",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#1E293B",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#0F172A",
    alignItems: "center",
  },
  loginText: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
