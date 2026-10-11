import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useFormContext, useWatch } from "react-hook-form";
import { SignUpStepLayout } from "@/src/components/auth/sign-up/sign-up-step-layout";
import { StepField } from "@/src/components/auth/sign-up/step-field";
import { useEditing } from "@/src/components/auth/sign-up/use-editing";
import { useSignUpAvailability } from "@/src/api/hooks/use-sign-up-availability";
import { ApiError } from "@/src/api/api-error";
import { signUpSchema, type SignUpValues } from "@/src/validation";

export default function EmailStep() {
  const editing = useEditing();
  const { trigger, getValues, setError, clearErrors, formState } =
    useFormContext<SignUpValues>();
  const email = useWatch<SignUpValues>({ name: "email" }) ?? "";
  const availability = useSignUpAvailability();

  const formatOk = signUpSchema.shape.email.safeParse(email).success;
  const taken =
    formState.errors.email?.message === "Ten email jest już zajęty.";
  const canContinue = formatOk && !taken && !availability.isPending;

  const advance = () => {
    if (editing) router.back();
    else router.push("/sign-up/username");
  };

  const onContinue = async () => {
    const valid = await trigger("email");
    if (!valid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    availability.mutate(
      { email: getValues("email") },
      {
        onSuccess: (result) => {
          if (result.emailAvailable === false) {
            setError("email", { message: "Ten email jest już zajęty." });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
          }
          clearErrors("email");
          advance();
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.userMessage
              : "Nie udało się sprawdzić emaila.";
          setError("email", { message });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      },
    );
  };

  return (
    <SignUpStepLayout
      title="Jaki jest Twój email?"
      subtitle="Wyślemy na niego link aktywacyjny."
      onContinue={onContinue}
      loading={availability.isPending}
      disabled={!canContinue}
    >
      <StepField
        name="email"
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={onContinue}
      />
    </SignUpStepLayout>
  );
}
