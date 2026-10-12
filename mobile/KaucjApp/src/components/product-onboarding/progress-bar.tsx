import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors, rounded, spacing } from "@/src/theme";
import { productOnboardingCopy } from "@/src/constants/product-onboarding/copy";

type SingleProgress = {
  mode: "single";
  current: number;
  total: number;
  filledRatio: number;
  reduceMotion?: boolean;
};

type SplitProgress = {
  mode: "split";
  current: number;
  total: number;
  part1: { filled: number; total: number };
  part2: { filled: number; total: number };
  reduceMotion?: boolean;
};

type ProgressBarProps = SingleProgress | SplitProgress;

function Segment({
  ratio,
  reduceMotion,
}: {
  ratio: number;
  reduceMotion?: boolean;
}) {
  const width = useSharedValue(ratio);

  useEffect(() => {
    width.value = reduceMotion
      ? ratio
      : withSpring(ratio, { damping: 20, stiffness: 180 });
  }, [ratio, reduceMotion, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(1, Math.max(0, width.value)) * 100}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

export default function ProgressBar(props: ProgressBarProps) {
  const a11yLabel = productOnboardingCopy.a11y.stepOf(props.current, props.total);

  if (props.mode === "single") {
    return (
      <View
        style={styles.wrap}
        accessibilityRole="progressbar"
        accessibilityLabel={a11yLabel}
        accessibilityValue={{
          min: 1,
          max: props.total,
          now: props.current,
        }}
      >
        <Segment ratio={props.filledRatio} reduceMotion={props.reduceMotion} />
      </View>
    );
  }

  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityLabel={a11yLabel}
      accessibilityValue={{ min: 1, max: props.total, now: props.current }}
    >
      <View style={styles.splitRow}>
        <View style={styles.splitCol}>
          <Text style={styles.partLabel}>{productOnboardingCopy.parts.part1}</Text>
          <Segment
            ratio={props.part1.filled / Math.max(1, props.part1.total)}
            reduceMotion={props.reduceMotion}
          />
        </View>
        <View style={styles.splitCol}>
          <Text style={styles.partLabel}>{productOnboardingCopy.parts.part2}</Text>
          <Segment
            ratio={props.part2.filled / Math.max(1, props.part2.total)}
            reduceMotion={props.reduceMotion}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
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
  splitRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  splitCol: {
    flex: 1,
    gap: 6,
  },
  partLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
});
