import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors, rounded, spacing } from "@/src/theme";

export default function SectionSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} />
      ))}
    </View>
  );
}

function SkeletonBlock() {
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.block, style]}>
      <View style={styles.lineWide} />
      <View style={styles.lineMid} />
      <View style={styles.lineShort} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  block: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.status.border,
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 96,
  },
  lineWide: {
    height: 14,
    width: "70%",
    borderRadius: 7,
    backgroundColor: colors.primary.light,
  },
  lineMid: {
    height: 12,
    width: "50%",
    borderRadius: 6,
    backgroundColor: colors.primary.light,
  },
  lineShort: {
    height: 12,
    width: "35%",
    borderRadius: 6,
    backgroundColor: colors.primary.light,
  },
});
