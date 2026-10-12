import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import RoleCard from "./role-card";
import { AppRole } from "@/src/types/user";
import { productOnboardingCopy, ROLE_ORDER } from "@/src/constants/product-onboarding/copy";
import { colors, spacing } from "@/src/theme";

interface RoleSelectScreenProps {
  selectedRole: AppRole | null;
  onSelect: (role: AppRole) => void;
  reduceMotion?: boolean;
}

export default function RoleSelectScreen({
  selectedRole,
  onSelect,
  reduceMotion,
}: RoleSelectScreenProps) {
  const content = (
    <View style={styles.wrap}>
      <Text style={styles.title}>{productOnboardingCopy.roleSelect.title}</Text>
      <Text style={styles.subtitle}>
        {productOnboardingCopy.roleSelect.subtitle}
      </Text>
      <View style={styles.list} accessibilityRole="radiogroup">
        {ROLE_ORDER.map((role) => (
          <RoleCard
            key={role}
            role={role}
            selected={selectedRole === role}
            onPress={() => onSelect(role)}
          />
        ))}
      </View>
    </View>
  );

  if (reduceMotion) return content;

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)}>
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
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.text.secondary,
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
