import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useUpdateUser } from "@/src/api/hooks/use-user";
import { useAuthStore } from "@/src/auth/auth-store";
import { getDefaultRouteForAppRole } from "@/src/lib/map-user";
import { colors, spacing } from "@/src/theme";

/**
 * Minimal host for commit 2: skip completes onboarding via PATCH.
 * Full A/B/C UI lands in later commits; replay mode leaves the flag untouched.
 */
export default function ProductOnboardingHost() {
  const params = useLocalSearchParams<{ mode?: string; role?: string }>();
  const isReplay = params.mode === "replay";
  const { mutate: updateUser, isPending } = useUpdateUser();
  const user = useAuthStore((state) => state.user);
  const patchUser = useAuthStore((state) => state.patchUser);
  const [isFinishing, setIsFinishing] = useState(false);

  const leaveToApp = () => {
    router.replace(getDefaultRouteForAppRole(user?.appRole));
  };

  const finishFirstRun = () => {
    setIsFinishing(true);
    updateUser(
      { productOnboardingCompleted: true },
      {
        onSuccess: () => {
          leaveToApp();
        },
        onError: () => {
          setIsFinishing(false);
          Alert.alert(
            "Brak połączenia",
            "Nie udało się zapisać postępu. Spróbuj ponownie lub kontynuuj offline.",
            [
              { text: "Spróbuj ponownie", onPress: finishFirstRun },
              {
                text: "Kontynuuj offline",
                style: "destructive",
                onPress: async () => {
                  await patchUser({ productOnboardingCompleted: true });
                  leaveToApp();
                },
              },
            ],
          );
        },
      },
    );
  };

  const handleSkipOrDone = () => {
    if (isReplay) {
      if (router.canGoBack()) {
        router.back();
      } else {
        leaveToApp();
      }
      return;
    }
    finishFirstRun();
  };

  const busy = isPending || isFinishing;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={handleSkipOrDone}
          disabled={busy}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Pomiń"
          style={styles.skipHit}
        >
          <Text style={styles.skipText}>Pomiń</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Jak działa KaucjApp</Text>
        <Text style={styles.subtitle}>
          {isReplay
            ? "Przewodnik produktowy (podgląd)."
            : "Krótki przewodnik po wystawianiu i odbiorze opakowań. Pełne ekrany pojawią się w kolejnej aktualizacji — możesz pominąć."}
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleSkipOrDone}
          disabled={busy}
          style={({ pressed }) => [
            styles.cta,
            pressed && styles.ctaPressed,
            busy && styles.ctaDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isReplay ? "Zamknij" : "Zaczynam"}
        >
          {busy ? (
            <ActivityIndicator color={colors.text.white} />
          ) : (
            <Text style={styles.ctaLabel}>
              {isReplay ? "Zamknij" : "Zaczynam"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  skipHit: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  skipText: {
    fontSize: 17,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
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
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  cta: {
    backgroundColor: colors.primary.base,
    borderRadius: 16,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaPressed: {
    backgroundColor: colors.primary.dark,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaLabel: {
    color: colors.text.white,
    fontSize: 17,
    fontWeight: "700",
  },
});
