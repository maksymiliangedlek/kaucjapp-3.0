import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Package, Truck, Layers } from "lucide-react-native";
import { colors, rounded, spacing } from "@/src/theme";
import { AppRole } from "@/src/types/user";
import { productOnboardingCopy } from "@/src/constants/product-onboarding/copy";

const ICONS = {
  OFFERER: Package,
  COLLECTOR: Truck,
  BOTH: Layers,
} as const;

interface RoleCardProps {
  role: AppRole;
  selected: boolean;
  onPress: () => void;
}

export default function RoleCard({ role, selected, onPress }: RoleCardProps) {
  const Icon = ICONS[role];
  const copy = productOnboardingCopy.roleSelect.options[role];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${copy.title}. ${copy.subtitle}`}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <Icon
          size={22}
          color={selected ? colors.primary.base : colors.text.secondary}
        />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    padding: spacing.md,
    minHeight: 72,
    borderRadius: rounded.xl,
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.status.border,
  },
  cardSelected: {
    borderColor: colors.primary.base,
    backgroundColor: colors.primary.light,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.main,
  },
  iconWrapSelected: {
    backgroundColor: colors.background.card,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.status.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.primary.base,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.base,
  },
});
