import React from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  /** Optional custom back handler (e.g. unsaved-changes guard). */
  onBack?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export default function AdminHeader({ title, subtitle, showBack, onBack, rightAction }: AdminHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showBack && (
          <TouchableOpacity onPress={() => (onBack ? onBack() : router.back())} style={styles.backBtn}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.accent.gold} />
          </TouchableOpacity>
        )}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.actionBtn}>
            <Ionicons name={rightAction.icon} size={22} color={colors.accent.gold} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent.goldLight,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18, 18, 20, 0.6)",
    borderWidth: 1,
    borderColor: colors.border.goldLight,
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent.goldLight,
    borderWidth: 1,
    borderColor: colors.border.goldLight,
  },
});