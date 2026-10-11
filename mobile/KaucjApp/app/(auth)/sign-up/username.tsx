import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useFormContext, useWatch } from "react-hook-form";
import { SignUpStepLayout } from "@/src/components/auth/sign-up/sign-up-step-layout";
import { StepField } from "@/src/components/auth/sign-up/step-field";
import { useEditing } from "@/src/components/auth/sign-up/use-editing";
import { useSignUpAvailability } from "@/src/api/hooks/use-sign-up-availability";
import { ApiError } from "@/src/api/api-error";
import { signUpSchema, type SignUpValues } from "@/src/validation";

type AvailabilityHint = "idle" | "checking" | "available" | "taken" | "error";

export default function UsernameStep() {
  const editing = useEditing();
  const { trigger, setError, clearErrors } = useFormContext<SignUpValues>();
  const userName = useWatch<SignUpValues>({ name: "userName" }) ?? "";
  const { mutate, isPending } = useSignUpAvailability();
  const [hint, setHint] = useState<AvailabilityHint>("idle");
  const requestId = useRef(0);

  const formatOk = signUpSchema.shape.userName.safeParse(userName).success;

  useEffect(() => {
    if (!formatOk) {
      setHint("idle");
      return;
    }

    const id = ++requestId.current;
    setHint("checking");
    const timer = setTimeout(() => {
      mutate(
        { username: userName.trim() },
        {
          onSuccess: (result) => {
            if (id !== requestId.current) return;
            if (result.usernameAvailable === false) {
              setHint("taken");
              setError("userName", { message: "Nazwa zajęta" });
              return;
            }
            clearErrors("userName");
            setHint("available");
          },
          onError: (error) => {
            if (id !== requestId.current) return;
            setHint("error");
            const message =
              error instanceof ApiError
                ? error.userMessage
                : "Nie udało się sprawdzić nazwy.";
            setError("userName", { message });
          },
        },
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [userName, formatOk, mutate, setError, clearErrors]);

  const canContinue = formatOk && hint === "available" && !isPending;

  const advance = () => {
    if (editing) router.back();
    else router.push("/sign-up/phone");
  };

  const onContinue = async () => {
    const valid = await trigger("userName");
    if (!valid || hint !== "available") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    advance();
  };

  const hintText =
    hint === "checking"
      ? "Sprawdzam…"
      : hint === "available"
        ? "Nazwa dostępna"
        : hint === "taken"
          ? undefined
          : undefined;

  const hintTone =
    hint === "available" ? "success" : hint === "checking" ? "muted" : "muted";

  return (
    <SignUpStepLayout
      title="Wybierz nazwę użytkownika"
      subtitle="Tak zobaczą Cię inni."
      onContinue={onContinue}
      loading={isPending && hint === "checking"}
      disabled={!canContinue}
    >
      <StepField
        name="userName"
        label="Nazwa użytkownika"
        autoCapitalize="none"
        autoComplete="username"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={onContinue}
        hint={hintText}
        hintTone={hintTone}
      />
    </SignUpStepLayout>
  );
}
