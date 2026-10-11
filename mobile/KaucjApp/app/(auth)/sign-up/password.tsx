import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useFormContext, useWatch } from "react-hook-form";
import PasswordChecklist from "@/src/components/auth/password-checklist";
import { SignUpStepLayout } from "@/src/components/auth/sign-up/sign-up-step-layout";
import { StepField } from "@/src/components/auth/sign-up/step-field";
import { useEditing } from "@/src/components/auth/sign-up/use-editing";
import { colors, spacing } from "@/src/theme";
import { signUpSchema, type SignUpValues } from "@/src/validation";

export default function PasswordStep() {
  const editing = useEditing();
  const [hidden, setHidden] = useState(true);
  const { trigger } = useFormContext<SignUpValues>();
  const password = useWatch<SignUpValues>({ name: "password" }) ?? "";

  const canContinue = signUpSchema.shape.password.safeParse(password).success;

  const onContinue = async () => {
    const valid = await trigger("password");
    if (!valid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (editing) router.back();
    else router.push("/sign-up/summary");
  };

  return (
    <SignUpStepLayout
      title="Ustaw hasło"
      subtitle="Mocne hasło chroni Twoje konto."
      onContinue={onContinue}
      disabled={!canContinue}
    >
      <StepField
        name="password"
        label="Hasło"
        secureTextEntry={hidden}
        autoComplete="new-password"
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={onContinue}
      />
      <Pressable
        onPress={() => setHidden((value) => !value)}
        hitSlop={8}
        accessibilityRole="button"
      >
        <Text style={styles.toggle}>{hidden ? "Pokaż hasło" : "Ukryj hasło"}</Text>
      </Pressable>
      <PasswordChecklist password={password} />
    </SignUpStepLayout>
  );
}

const styles = StyleSheet.create({
  toggle: {
    marginTop: spacing.xs,
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary.base,
  },
});
