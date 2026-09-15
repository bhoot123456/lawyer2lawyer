import React, { memo } from "react";
import { colors } from "@/theme/designSystem";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AI_GOLD, AI_TEXT_PRIMARY, AI_TEXT_SECONDARY, AI_BG } from "../constants";

interface AIHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

const AIHeader: React.FC<AIHeaderProps> = ({ title, subtitle, showBack = true, rightAction }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={AI_GOLD} />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightAction && (
          <TouchableOpacity style={styles.actionButton} onPress={rightAction.onPress}>
            <Ionicons name={rightAction.icon as any} size={22} color={AI_GOLD} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: AI_BG,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18, 18, 20, 0.6)",
    borderWidth: 1,
    borderColor: colors.border.gold,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: AI_TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: AI_TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18, 18, 20, 0.6)",
    borderWidth: 1,
    borderColor: colors.border.gold,
    marginLeft: 8,
  },
});

export default memo(AIHeader);