import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { colors, rounded, spacing } from "@/src/theme";

interface GuideCtaProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

export default function GuideCta({
  label,
  onPress,
  disabled,
  loading,
  accessibilityLabel,
}: GuideCtaProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.white} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary.base,
    borderRadius: rounded.xl,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    backgroundColor: colors.primary.dark,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: colors.background.disabled,
  },
  label: {
    color: colors.text.white,
    fontSize: 17,
    fontWeight: "700",
  },
});
