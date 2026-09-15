import React, { memo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AI_GOLD, AI_GOLD_LIGHT, AI_CARD_BG, AI_TEXT_PRIMARY, AI_TEXT_SECONDARY } from "../constants";

interface AIResultCardProps {
  title?: string;
  children: React.ReactNode;
  scrollable?: boolean;
}

const AIResultCard: React.FC<AIResultCardProps> = ({ title, children, scrollable = true }) => {
  const content = (
    <View style={styles.card}>
      {title && (
        <View style={styles.titleRow}>
          <View style={styles.titleAccent} />
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      <View style={styles.divider} />
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

/** Reusable section inside a result card */
export const ResultSection: React.FC<{ label: string; text: string }> = memo(
  function ResultSection({ label, text }) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{label}</Text>
        <Text style={styles.sectionText}>{text}</Text>
      </View>
    );
  }
);

/** Reusable bullet list inside a result card */
export const ResultBulletList: React.FC<{ label: string; items: string[] }> = memo(
  function ResultBulletList({ label, items }) {
    return (
      <View style={styles.section}>
        {label ? <Text style={styles.sectionLabel}>{label}</Text> : null}
        {items.map((item, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: AI_CARD_BG,
    borderWidth: 1,
    borderColor: AI_GOLD_LIGHT,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  titleAccent: {
    width: 3,
    height: 20,
    backgroundColor: AI_GOLD,
    borderRadius: 2,
    marginRight: 10,
  },
  title: {
    color: AI_GOLD,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: AI_GOLD_LIGHT,
    marginBottom: 14,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    color: AI_GOLD,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionText: {
    color: AI_TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingLeft: 4,
  },
  bullet: {
    color: AI_GOLD,
    fontSize: 14,
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    color: AI_TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    flex: 1,
  },
});

export default memo(AIResultCard);