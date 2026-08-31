import React from "react";
import { Text, StyleSheet } from "react-native";

import GlassCard from "@/components/ui/GlassCard";

export default function LawyerCard({ lawyer, onPress }) {
  const name = lawyer?.name ?? "Lawyer";
  const specialty = lawyer?.specialization ?? lawyer?.specialty ?? "General";
  const location = [lawyer?.city, lawyer?.state].filter(Boolean).join(", ");

  return (
    <GlassCard onPress={onPress} accent="#B58D3D" borderColor="rgba(181, 141, 61, 0.35)">
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.specialty}>{specialty}</Text>
      {location ? <Text style={styles.location}>{location}</Text> : null}
      {lawyer?.phone ? <Text style={styles.location}>{lawyer.phone}</Text> : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 16, fontWeight: "900", marginBottom: 4, color: "#FFFFFF" },
  specialty: { color: "#D4AF37", fontWeight: "900" },
  location: { color: "#B0B4BA", marginTop: 4, fontWeight: "700" },
});

