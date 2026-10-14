import React from "react";
import { StyleSheet, Text, ActivityIndicator, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors, rounded, spacing } from "@/src/theme";

interface AuthButtonProps {
  onPress: () => void;
  label: string;
  isLoading?: boolean;
  disabled?: boolean;
}

const PRESS_SPRING = { damping: 20, stiffness: 420, mass: 0.55 };

export function AuthButton({
  onPress,
  label,
  isLoading,
  disabled,
}: AuthButtonProps) {
  const isDisabled = !!disabled || !!isLoading;
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const setPressed = (pressed: boolean) => {
    if (isDisabled) return;
    const next = pressed ? 0.97 : 1;
    scale.value = reduceMotion
      ? next
      : withSpring(next, PRESS_SPRING);
  };

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        style={[styles.button, disabled && styles.disabled]}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.text.white} />
        ) : (
          <Text style={[styles.text, disabled && styles.textDisabled]}>
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
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
