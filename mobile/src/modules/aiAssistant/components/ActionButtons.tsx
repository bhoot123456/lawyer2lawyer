import React, { memo, useCallback } from "react";
import { View, StyleSheet, Alert, Share, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import { AI_GOLD_LIGHT } from "../constants";
import AIButton from "./AIButton";

interface ActionButtonsProps {
  /** The text content to copy/share */
  text: string;
  /** Called when save is triggered */
  onSave?: () => void;
  /** Whether to show the save button */
  showSave?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ text, onSave, showSave = true }) => {
  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert("Copied", "Content copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  }, [text]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: text,
        title: "AI Legal Assistant",
      });
    } catch {
      // User cancelled share
    }
  }, [text]);

  const handleSave = useCallback(() => {
    onSave?.();
  }, [onSave]);

  return (
    <View style={styles.container}>
      <AIButton
        title="Copy"
        onPress={handleCopy}
        variant="secondary"
        style={styles.button}
      />
      <AIButton
        title="Share"
        onPress={handleShare}
        variant="secondary"
        style={styles.button}
      />
      {showSave && (
        <AIButton
          title="Save"
          onPress={handleSave}
          variant="secondary"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  button: {
    flex: 1,
  },
});

export default memo(ActionButtons);