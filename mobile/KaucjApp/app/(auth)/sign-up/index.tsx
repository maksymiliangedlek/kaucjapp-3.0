import { useRef } from "react";
import { TextInput } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useFormContext, useWatch } from "react-hook-form";
import { SignUpStepLayout } from "@/src/components/auth/sign-up/sign-up-step-layout";
import { StepField } from "@/src/components/auth/sign-up/step-field";
import { useEditing } from "@/src/components/auth/sign-up/use-editing";
import { signUpSchema, type SignUpValues } from "@/src/validation";

export default function NameStep() {
  const lastNameRef = useRef<TextInput>(null);
  const editing = useEditing();
  const { trigger } = useFormContext<SignUpValues>();
  const firstName = useWatch<SignUpValues>({ name: "firstName" }) ?? "";
  const lastName = useWatch<SignUpValues>({ name: "lastName" }) ?? "";

  const canContinue =
    signUpSchema.shape.firstName.safeParse(firstName).success &&
    signUpSchema.shape.lastName.safeParse(lastName).success;

  const onContinue = async () => {
    const valid = await trigger(["firstName", "lastName"]);
    if (!valid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (editing) router.back();
    else router.push("/sign-up/email");
  };

  return (
    <SignUpStepLayout
      title="Jak masz na imię?"
      subtitle="Imię i nazwisko, które zobaczą inni."
      onContinue={onContinue}
      disabled={!canContinue}
    >
      <StepField
        name="firstName"
        label="Imię"
        autoComplete="given-name"
        autoCapitalize="words"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => lastNameRef.current?.focus()}
      />
      <StepField
        ref={lastNameRef}
        name="lastName"
        label="Nazwisko"
        autoComplete="family-name"
        autoCapitalize="words"
        autoFocus={false}
        returnKeyType="done"
        onSubmitEditing={onContinue}
      />
    </SignUpStepLayout>
  );
}
