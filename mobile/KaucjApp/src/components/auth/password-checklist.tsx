import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors, spacing } from "@/src/theme";

type PasswordChecklistProps = {
  password?: string;
};

const RULES = [
  { label: "Co najmniej 6 znaków", test: (password: string) => password.length >= 6 },
  { label: "Wielka litera", test: (password: string) => /[A-Z]/.test(password) },
  { label: "Mała litera", test: (password: string) => /[a-z]/.test(password) },
  { label: "Cyfra", test: (password: string) => /[0-9]/.test(password) },
  { label: "Znak specjalny", test: (password: string) => /[^a-zA-Z0-9]/.test(password) },
];

export default function PasswordChecklist({
  password = "",
}: PasswordChecklistProps) {
  return (
    <View style={styles.container}>
      {RULES.map((rule) => (
        <ChecklistItem
          key={rule.label}
          label={rule.label}
          isMet={rule.test(password)}
        />
      ))}
    </View>
  );
}

const ChecklistItem = ({
  label,
  isMet,
}: {
  label: string;
  isMet: boolean;
}) => {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(isMet ? 1 : 0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      progress.value = isMet ? 1 : 0;
      return;
    }
    if (isMet) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (reduceMotion) {
      progress.value = isMet ? 1 : 0;
      return;
    }
    progress.value = isMet
      ? withSpring(1, { duration: 280, dampingRatio: 0.85 })
      : withTiming(0, { duration: 160 });
  }, [isMet, progress, reduceMotion]);

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [colors.text.muted, colors.primary.base],
    ),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.08 }],
  }));

  return (
    <View style={styles.ruleRow}>
      <Animated.View style={iconStyle}>
        <Feather
          name={isMet ? "check-circle" : "circle"}
          size={16}
          color={isMet ? colors.status.success : colors.text.muted}
        />
      </Animated.View>
      <Animated.Text style={[styles.ruleText, textStyle]}>{label}</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ruleText: {
    fontSize: 15,
    marginLeft: spacing.sm,
  },
});
