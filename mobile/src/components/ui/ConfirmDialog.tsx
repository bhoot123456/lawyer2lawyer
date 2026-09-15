import React, { useCallback, useRef, useState } from "react";
import { colors } from "@/theme/designSystem";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  /** `null` hides the cancel button (single-button notice/alert dialog). */
  cancelLabel?: string | null;
  danger?: boolean;
}

interface ConfirmDialogProps extends ConfirmDialogOptions {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Cross-platform confirmation / notice dialog.
 *
 * WHY THIS EXISTS: React Native's `Alert.alert()` is a silent no-op on web —
 * react-native-web ships an empty stub (`static alert() {}`), so any flow
 * gated behind it (e.g. the delete confirmation) never rendered and never
 * fired its API call on web. This component uses RN `Modal`, which
 * react-native-web implements for real, so it renders identically on web,
 * iOS, and Android. Styling mirrors the existing AdminConfirmDialog.
 */
export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const accent = danger ? "#EF4444" : colors.accent.gold;
  // undefined => default two-button confirm; explicit null => notice mode.
  const showCancel = cancelLabel !== null;
  const label = confirmLabel || (showCancel ? "Confirm" : "OK");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.row}>
            {showCancel ? (
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
                <Text style={styles.cancelText}>{cancelLabel || "Cancel"}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: `${accent}22`, borderColor: `${accent}66` }]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, { color: accent }]}>{label}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Promise-based confirm/notice helper for function screens.
 *
 * Render the returned `element` once per screen, then:
 *   const ok = await confirm({ title, message, confirmLabel: "Delete", danger: true });
 *   notice({ title: "Done", message: "..." }); // single OK button
 *
 * `confirm` resolves true/false; `notice` resolves true (result is ignorable).
 */
export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const resolverRef = useRef<((accepted: boolean) => void) | null>(null);

  const finish = useCallback((accepted: boolean) => {
    setOptions(null);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(accepted);
  }, []);

  const show = useCallback((opts: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      // Replace any pending dialog, resolving it as cancelled so no promise
      // is ever left dangling (no stuck awaits / unhandled rejections).
      resolverRef.current?.(false);
      resolverRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  const confirm = useCallback(
    (opts: ConfirmDialogOptions) => show({ cancelLabel: "Cancel", ...opts }),
    [show],
  );

  const notice = useCallback(
    (opts: ConfirmDialogOptions) => show({ cancelLabel: null, ...opts }),
    [show],
  );

  const element = (
    <ConfirmDialog
      visible={options !== null}
      title={options?.title ?? ""}
      message={options?.message ?? ""}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      danger={options?.danger}
      onConfirm={() => finish(true)}
      onCancel={() => finish(false)}
    />
  );

  return { confirm, notice, element, visible: options !== null };
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
    borderColor: colors.border.gold,
    padding: 20,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "800",
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
    fontWeight: "800",
  },
});