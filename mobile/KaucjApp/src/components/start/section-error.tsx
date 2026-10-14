import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, rounded, spacing } from "@/src/theme";

export default function SectionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={styles.btn}
          accessibilityRole="button"
          accessibilityLabel="Spróbuj ponownie"
        >
          <Text style={styles.btnText}>Spróbuj ponownie</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.status.border,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  text: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  btn: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  btnText: {
    color: colors.primary.base,
    fontWeight: "700",
    fontSize: 14,
  },
});
