import { useEffect, useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFormContext, useWatch } from "react-hook-form";
import { useAuth } from "@/src/auth/use-auth";
import { API_ERROR_CODES, ApiError } from "@/src/api/api-error";
import { useSignUpAvailability } from "@/src/api/hooks/use-sign-up-availability";
import { ErrorBanner } from "@/src/components/auth/error-banner";
import { SignUpStepLayout } from "@/src/components/auth/sign-up/sign-up-step-layout";
import { formatPhoneGroups } from "@/src/components/auth/sign-up/phone-format";
import { colors, spacing } from "@/src/theme";
import type { SignUpValues } from "@/src/validation";

const TERMS_URL = "https://kaucjapp.pl/terms";
const PRIVACY_URL = "https://kaucjapp.pl/privacy-policy";

const ROWS: { label: string; field: keyof SignUpValues; href: Href }[] = [
  { label: "Imię i nazwisko", field: "firstName", href: "/sign-up" },
  { label: "Email", field: "email", href: "/sign-up/email" },
  { label: "Nazwa użytkownika", field: "userName", href: "/sign-up/username" },
  { label: "Telefon", field: "phoneNumber", href: "/sign-up/phone" },
];

export default function SummaryStep() {
  const { getValues, setError } = useFormContext<SignUpValues>();
  const { signUp, isSigningUp, signUpError } = useAuth();
  const availability = useSignUpAvailability();
  const values = useWatch<SignUpValues>();
  const handledError = useRef<ApiError | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (!signUpError || signUpError === handledError.current) return;
    if (signUpError.errorCode !== API_ERROR_CODES.ACCOUNT_ALREADY_EXISTS) return;
    handledError.current = signUpError;

    const current = getValues();
    availability.mutate(
      { email: current.email, username: current.userName },
      {
        onSuccess: (result) => {
          if (result.emailAvailable === false) {
            setError("email", { message: "Ten email jest już zajęty." });
            router.push({ pathname: "/sign-up/email", params: { editing: "1" } });
            return;
          }
          if (result.usernameAvailable === false) {
            setError("userName", { message: "Ta nazwa jest zajęta." });
            router.push({
              pathname: "/sign-up/username",
              params: { editing: "1" },
            });
          }
        },
      },
    );
  }, [availability, getValues, setError, signUpError]);

  const display = (field: keyof SignUpValues) => {
    if (field === "firstName") {
      return `${values.firstName ?? ""} ${values.lastName ?? ""}`.trim();
    }
    if (field === "phoneNumber") {
      const digits = values.phoneNumber ?? "";
      return digits ? `+48 ${formatPhoneGroups(digits)}` : "";
    }
    return values[field] ?? "";
  };

  const onSubmit = () => {
    if (!acceptedTerms) return;
    signUp(getValues(), {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      },
    });
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <SignUpStepLayout
      title="Wszystko się zgadza?"
      subtitle="Możesz poprawić każde pole przed założeniem konta."
      continueLabel="Załóż konto"
      onContinue={onSubmit}
      loading={isSigningUp || availability.isPending}
      disabled={!acceptedTerms}
    >
      {signUpError &&
        signUpError.errorCode !== API_ERROR_CODES.ACCOUNT_ALREADY_EXISTS && (
          <ErrorBanner
            message={signUpError.userMessage}
            isNetworkError={signUpError.isNetworkError}
          />
        )}
      <View style={styles.list}>
        {ROWS.map((row) => (
          <Pressable
            key={row.label}
            onPress={() =>
              router.push({ pathname: row.href, params: { editing: "1" } } as Href)
            }
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel={`${row.label}, edytuj`}
          >
            <View style={styles.copy}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{display(row.field)}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.text.muted} />
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setAcceptedTerms((value) => !value);
        }}
        style={styles.termsRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acceptedTerms }}
      >
        <View style={[styles.checkbox, acceptedTerms && styles.checkboxOn]}>
          {acceptedTerms ? (
            <Feather name="check" size={14} color={colors.text.white} />
          ) : null}
        </View>
        <Text style={styles.termsText}>
          Akceptuję{" "}
          <Text style={styles.link} onPress={() => openLink(TERMS_URL)}>
            regulamin
          </Text>
          {" "}i{" "}
          <Text style={styles.link} onPress={() => openLink(PRIVACY_URL)}>
            politykę prywatności
          </Text>
          .
        </Text>
      </Pressable>
    </SignUpStepLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.status.border,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  value: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text.primary,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.status.border,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: colors.primary.base,
    borderColor: colors.primary.base,
  },
  termsText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  link: {
    color: colors.primary.base,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
