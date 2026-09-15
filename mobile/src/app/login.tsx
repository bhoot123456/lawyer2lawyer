import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { KeyboardAwareView } from "@/components/ui/KeyboardAwareView";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import AppInput from "@/components/ui/AppInput";
import PremiumButton from "@/components/ui/PremiumButton";
import GlassCard from "@/components/ui/GlassCard";
import { colors, radii, spacing, typography } from "@/theme/designSystem";
import { blurActiveElement } from "@/utils/blurActiveElement";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const { notice: noticeDialog, element: dialogElement } = useConfirmDialog();
  // Cross-platform notice dialogs (raw alert() is unstyled; Alert.alert is a no-op on web).

  const validate = (): boolean => {
    let valid = true;
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Email address is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError(undefined);
    }
    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError(undefined);
    }
    return valid;
  };

  const onSubmit = async () => {
    if (busy) return;
    if (!validate()) return;
    setBusy(true);
    try {
      const { login, persistTokens } = await import("@/services/api");
      const { token, refreshToken, user } = await login({ email: email.trim(), password });
      if (user?.role !== "admin") {
        void noticeDialog({
          title: "Not authorized",
          message: "You are not authorized to access the Admin Panel.",
          danger: true,
        });
        return;
      }
      await persistTokens({ token, refreshToken });
      blurActiveElement();
      router.replace("/admin" as any);
    } catch (e: any) {
      const serverMessage = e?.response?.data?.message;
      const msg = serverMessage || e?.message || "Login failed";
      void noticeDialog({ title: "Login failed", message: String(msg), danger: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <KeyboardAwareView
        style={styles.container}
        contentContainerStyle={styles.innerContainer}
      >
        <GlassCard borderColor={colors.border.gold} accent={colors.accent.gold} elevation={3}>
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={[styles.brandIconWrap, { backgroundColor: colors.accent.goldSubtle, borderColor: colors.border.gold }]}>
              <Ionicons name="scale" size={28} color={colors.accent.gold} />
            </View>
            <Text style={styles.logo}>Lawyer2Lawyer</Text>
            <Text style={styles.brandTagline}>Your Legal Practice. Connected.</Text>
          </View>

          <View style={styles.divider} />

          {/* Login Form */}
          <View style={styles.formSection}>
            <Text style={styles.heading}>Admin Login</Text>
            <Text style={styles.subHeading}>Sign in to access the Admin Panel</Text>

            <View style={styles.form}>
              <AppInput
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (emailError) setEmailError(undefined);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={emailError}
                leftIcon={<Ionicons name="mail-outline" size={20} color={colors.accent.gold} />}
              />

              <AppInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (passwordError) setPasswordError(undefined);
                }}
                autoCapitalize="none"
                secureTextEntry
                secureVisible={passwordVisible}
                onSecureVisibleChange={setPasswordVisible}
                passwordToggleAccessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                error={passwordError}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.accent.gold} />}
              />
            </View>

            <PremiumButton
              label={busy ? "Signing in…" : "Admin Login"}
              variant="primary"
              size="lg"
              loading={busy}
              disabled={busy}
              onPress={() => void onSubmit()}
            />
          </View>
        </GlassCard>
      </KeyboardAwareView>
      {dialogElement}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    justifyContent: "center",
    padding: spacing.lg,
  },
  innerContainer: {
    justifyContent: "center",
  },
  brandHeader: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  brandIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.accent.gold,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.muted,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.goldLight,
    marginVertical: spacing.md,
  },
  formSection: {
    gap: spacing.sm,
  },
  heading: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text.primary,
    letterSpacing: typography.h2.letterSpacing,
  },
  subHeading: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
});
