import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

import Navbar from "@/components/Navbar";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Navbar title="Lawyer2Lawyer" />

      <View style={styles.body}>
        <Text style={styles.title}>Home</Text>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("SearchLawyer")}
        >
          <Text style={styles.buttonText}>Search Lawyers</Text>
        </Pressable>

        <Pressable
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonTextSecondary}>Admin Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, padding: 16, gap: 12, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 8 },
  button: {
    backgroundColor: "#208AEF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  buttonSecondary: {
    backgroundColor: "#F0F0F3",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonTextSecondary: { color: "#000", fontWeight: "700" },
});
