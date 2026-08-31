import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import GlassCard from "@/components/ui/GlassCard";

export default function SectionCard({
  title,
  description,
  ctaText,
  onPress,
  accent = "#B58D3D",
}: {
  title: string;
  description?: string;
  ctaText?: string;
  onPress?: () => void;
  accent?: string;
}) {
  return (
    <GlassCard borderColor={`rgba(181, 141, 61, 0.35)`} accent={accent} onPress={onPress}>
      <Text style={[styles.sectionTitle, { color: accent }]}>{title}</Text>

      {description ? <Text style={styles.sectionDesc}>{description}</Text> : null}

      {ctaText ? (
        <Pressable
          style={[styles.sectionButton, { borderColor: accent }]}
          onPress={onPress}
        >
          <Text style={[styles.sectionButtonText, { color: accent }]}>{ctaText}</Text>
        </Pressable>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  sectionDesc: {
    color: "#B0B4BA",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  sectionButton: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
  },
  sectionButtonText: {
    fontWeight: "900",
    fontSize: 14,
  },
});

