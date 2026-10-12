import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import GuideIllustration from "./illustrations/guide-illustrations";
import { GuideStepConfig } from "@/src/constants/product-onboarding/steps";
import { colors, spacing } from "@/src/theme";

interface GuideStepScreenProps {
  step: GuideStepConfig;
  reduceMotion?: boolean;
}

export default function GuideStepScreen({
  step,
  reduceMotion,
}: GuideStepScreenProps) {
  const content = (
    <View style={styles.wrap}>
      <GuideIllustration id={step.illustration} statusBadge={step.statusBadge} />
      <Text style={styles.title}>{step.title}</Text>
      <Text style={styles.body}>{step.body}</Text>
    </View>
  );

  if (reduceMotion) return content;

  return (
    <Animated.View
      key={step.id}
      entering={FadeInDown.springify().damping(18).delay(40)}
    >
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.text.secondary,
  },
});
