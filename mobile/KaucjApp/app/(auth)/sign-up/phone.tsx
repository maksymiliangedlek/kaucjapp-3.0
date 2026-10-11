import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useFormContext, useWatch } from "react-hook-form";
import { SignUpStepLayout } from "@/src/components/auth/sign-up/sign-up-step-layout";
import { StepField } from "@/src/components/auth/sign-up/step-field";
import {
  formatPhoneGroups,
  stripPhoneDigits,
} from "@/src/components/auth/sign-up/phone-format";
import { useEditing } from "@/src/components/auth/sign-up/use-editing";
import { signUpSchema, type SignUpValues } from "@/src/validation";

export default function PhoneStep() {
  const editing = useEditing();
  const { trigger } = useFormContext<SignUpValues>();
  const phoneNumber = useWatch<SignUpValues>({ name: "phoneNumber" }) ?? "";

  const canContinue = signUpSchema.shape.phoneNumber.safeParse(phoneNumber).success;

  const onContinue = async () => {
    const valid = await trigger("phoneNumber");
    if (!valid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (editing) router.back();
    else router.push("/sign-up/password");
  };

  return (
    <SignUpStepLayout
      title="Numer telefonu"
      subtitle="Użyjemy go tylko do kontaktu w sprawie odbioru."
      onContinue={onContinue}
      disabled={!canContinue}
    >
      <StepField
        name="phoneNumber"
        label="Numer telefonu"
        prefix="+48"
        keyboardType="number-pad"
        autoComplete="tel"
        inputMode="numeric"
        displayValue={formatPhoneGroups(phoneNumber)}
        normalize={stripPhoneDigits}
        returnKeyType="done"
        onSubmitEditing={onContinue}
      />
    </SignUpStepLayout>
  );
}
