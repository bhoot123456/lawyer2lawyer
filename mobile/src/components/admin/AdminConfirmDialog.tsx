import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation dialog for destructive / irreversible admin actions. */
export default function AdminConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const accent = danger ? "#EF4444" : "#B58D3D";
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: `${accent}22`, borderColor: `${accent}66` }]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, { color: accent }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#121214",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(181,141,61,0.25)",
    padding: 20,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 8,
  },
  message: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(148,163,184,0.3)",
  },
  cancelText: {
    color: "#94A3B8",
    fontWeight: "800",
  },
  confirmText: {
    fontWeight: "900",
  },
});
