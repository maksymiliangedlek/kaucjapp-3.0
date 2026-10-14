import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  withSpring,
} from "react-native-reanimated";
import { colors, rounded } from "@/src/theme";
import { SIGN_UP_STEPS } from "@/src/validation";
import { signUpProgress } from "./sign-up-progress";

type Props = {
  index: number;
};

const PROGRESS_SPRING = { damping: 18, stiffness: 220, mass: 0.7 };

export function StepProgress({ index }: Props) {
  const reduceMotion = useReducedMotion();
  const target = (index + 1) / SIGN_UP_STEPS.length;

  useEffect(() => {
    cancelAnimation(signUpProgress);
    if (reduceMotion) {
      signUpProgress.value = target;
      return;
    }
    // Soft bounce when the fill advances between steps.
    signUpProgress.value = withSpring(target, PROGRESS_SPRING);
  }, [reduceMotion, target]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${signUpProgress.value * 100}%`,
  }));

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: SIGN_UP_STEPS.length,
        now: index + 1,
      }}
    >
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: rounded.pill,
    backgroundColor: colors.status.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: rounded.pill,
    backgroundColor: colors.primary.base,
  },
});
