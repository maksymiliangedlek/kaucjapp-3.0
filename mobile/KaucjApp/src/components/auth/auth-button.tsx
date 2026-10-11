import React from "react";
import { StyleSheet, Text, ActivityIndicator, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, rounded, spacing } from "@/src/theme";

interface AuthButtonProps {
  onPress: () => void;
  label: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function AuthButton({
  onPress,
  label,
  isLoading,
  disabled,
}: AuthButtonProps) {
  const isDisabled = !!disabled || !!isLoading;

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityState={{ disabled: isDisabled }}
      style={[styles.button, disabled && styles.disabled]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.text.white} />
      ) : (
        <Text style={[styles.text, disabled && styles.textDisabled]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    backgroundColor: colors.primary.base,
    borderRadius: rounded.apple,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
    shadowColor: colors.primary.base,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  disabled: {
    backgroundColor: colors.status.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: colors.text.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  textDisabled: {
    color: colors.text.muted,
  },
});
