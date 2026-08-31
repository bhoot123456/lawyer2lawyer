import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@/theme/designSystem";

type MetadataRowProps = {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
};

const MetadataRow: React.FC<MetadataRowProps> = ({ label, value, icon }) => {
  return (
    <View style={styles.row}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accent.goldSubtle,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.text.muted,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: typography.caption.letterSpacing,
    minWidth: 80,
  },
  value: {
    color: colors.text.primary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    lineHeight: typography.body.lineHeight,
    flex: 1,
    textAlign: "right",
  },
});

export default MetadataRow;
