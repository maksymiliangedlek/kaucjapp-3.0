import React from "react";
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors } from "@/src/theme";

const SIZE = 44;
const PRESS_SCALE = 1.18;
const SPRING = { damping: 18, stiffness: 420, mass: 0.6 };

type CircleChromeButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Circular chrome that expands on press — mirrors iOS liquid-glass
 * header back / bar button feedback (e.g. Moje oferty back).
 */
export default function CircleChromeButton({
  onPress,
  accessibilityLabel,
  children,
  style,
}: CircleChromeButtonProps) {
  const scale = useSharedValue(1);
  const reduceMotion = React.useRef(false);

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      reduceMotion.current = v;
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (v) => {
        reduceMotion.current = v;
      },
    );
    return () => sub.remove();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const setPressed = (pressed: boolean) => {
    if (reduceMotion.current) {
      scale.value = pressed ? PRESS_SCALE : 1;
      return;
    }
    scale.value = withSpring(pressed ? PRESS_SCALE : 1, SPRING);
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={4}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={styles.hit}
      >
        <BlurView intensity={40} tint="light" style={styles.chrome}>
          {children}
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: "hidden",
  },
  chrome: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.status.border,
  },
});
