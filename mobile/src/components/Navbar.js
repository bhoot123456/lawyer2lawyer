import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Navbar({ title }) {
  return (
    <View style={styles.navbar}>
      <Text style={styles.title}>{title ?? "Lawyer2Lawyer"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#161616",
    borderBottomWidth: 1,
    borderBottomColor: "#2E3135",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
});
