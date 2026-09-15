import React from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "@/components/ui/GlassCard";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
  onPress?: () => void;
}

export default function StatCard({ title, value, icon, color = colors.accent.gold, subtitle, onPress }: StatCardProps) {
  return (
    <GlassCard onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "45%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  textWrap: {
    flex: 1,
  },
  value: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
  },
  title: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
});