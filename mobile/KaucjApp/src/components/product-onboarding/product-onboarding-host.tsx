import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  AccessibilityInfo,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useUpdateUser } from "@/src/api/hooks/use-user";
import { useAuthStore } from "@/src/auth/auth-store";
import { appStorage } from "@/src/auth/secure-storage";
import { getDefaultRouteForAppRole } from "@/src/lib/map-user";
import { AppRole } from "@/src/types/user";
import { productOnboardingCopy } from "@/src/constants/product-onboarding/copy";
import {
  buildGuideSteps,
  GuidePermission,
  progressMeta,
} from "@/src/constants/product-onboarding/steps";
import { colors, spacing } from "@/src/theme";
import StackHeaderBackButton from "@/src/components/navigation/stack-header-back-button";
import RoleSelectScreen from "./role-select-screen";
import GuideStepScreen from "./guide-step-screen";
import ProgressBar from "./progress-bar";
import GuideCta from "./guide-cta";

function parseRoleParam(value: string | undefined): AppRole | null {
  if (value === "OFFERER" || value === "COLLECTOR" || value === "BOTH") {
    return value;
  }
  return null;
}

type ProductOnboardingHostProps = {
  /** Use the stack header slots (same as FAQ) instead of an in-body top bar. */
  useNativeHeader?: boolean;
};

export default function ProductOnboardingHost({
  useNativeHeader = false,
}: ProductOnboardingHostProps) {
  const params = useLocalSearchParams<{ mode?: string; role?: string }>();
  const navigation = useNavigation();
  const isReplay = params.mode === "replay";
  const replayRole = parseRoleParam(
    Array.isArray(params.role) ? params.role[0] : params.role,
  );

  const { mutate: updateUser, isPending } = useUpdateUser();
  const user = useAuthStore((state) => state.user);
  const patchUser = useAuthStore((state) => state.patchUser);

  const [selectedRole, setSelectedRole] = useState<AppRole | null>(
    () => replayRole ?? (isReplay ? user?.appRole ?? null : null),
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [onRoleScreen, setOnRoleScreen] = useState(() => !replayRole);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const askedPermissions = React.useRef<Set<GuidePermission>>(new Set());

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => sub.remove();
  }, []);

  const steps = useMemo(
    () => (selectedRole ? buildGuideSteps(selectedRole) : []),
    [selectedRole],
  );

  const currentStep = steps[stepIndex];
  const progress = selectedRole
    ? progressMeta(selectedRole, stepIndex, steps)
    : null;

  const leaveToApp = useCallback(() => {
    router.replace(getDefaultRouteForAppRole(user?.appRole ?? selectedRole));
  }, [selectedRole, user?.appRole]);

  const closeReplay = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (router.canDismiss()) {
      router.dismiss();
      return;
    }
    leaveToApp();
  }, [leaveToApp]);

  const requestPermissionIfNeeded = useCallback(
    async (permission?: GuidePermission) => {
      if (!permission || askedPermissions.current.has(permission)) return;
      askedPermissions.current.add(permission);
      try {
        if (permission === "location") {
          await Location.requestForegroundPermissionsAsync();
        } else if (permission === "notifications") {
          const current = await Notifications.getPermissionsAsync();
          if (current.status !== "granted") {
            await Notifications.requestPermissionsAsync();
          }
        }
      } catch {
        // Denial must not block onboarding.
      }
    },
    [],
  );

  useEffect(() => {
    if (!onRoleScreen && currentStep?.permission) {
      void requestPermissionIfNeeded(currentStep.permission);
    }
  }, [onRoleScreen, currentStep, requestPermissionIfNeeded]);

  const finishFirstRun = useCallback(() => {
    setIsFinishing(true);
    const localUpdates = {
      ...(selectedRole ? { appRole: selectedRole } : {}),
      productOnboardingCompleted: true as const,
    };
    updateUser(localUpdates, {
      onSuccess: async () => {
        // Guard `(tabs)` on productOnboardingCompleted — await local patch
        // before replace, otherwise navigation bounces back here with a stuck spinner.
        await patchUser(localUpdates);
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
                await appStorage.setPendingProductOnboardingSync({
                  appRole: selectedRole,
                });
                await patchUser(localUpdates);
                leaveToApp();
              },
            },
          ],
        );
      },
    });
  }, [leaveToApp, patchUser, selectedRole, updateUser]);

  const handleSkip = useCallback(() => {
    if (isReplay) {
      closeReplay();
      return;
    }
    finishFirstRun();
  }, [closeReplay, finishFirstRun, isReplay]);

  const handleBack = useCallback(() => {
    if (onRoleScreen) return;
    if (stepIndex === 0) {
      if (isReplay && replayRole) {
        closeReplay();
        return;
      }
      setOnRoleScreen(true);
      return;
    }
    setStepIndex((i) => i - 1);
  }, [closeReplay, isReplay, onRoleScreen, replayRole, stepIndex]);

  const handleNext = async () => {
    if (!reduceMotion) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (onRoleScreen) {
      if (!selectedRole) return;
      setOnRoleScreen(false);
      setStepIndex(0);
      return;
    }

    if (!currentStep) return;

    if (currentStep.isFinal || stepIndex >= steps.length - 1) {
      if (isReplay) {
        closeReplay();
      } else {
        finishFirstRun();
      }
      return;
    }

    setStepIndex((i) => i + 1);
  };

  const busy = isPending || isFinishing;
  const ctaDisabled = onRoleScreen && !selectedRole;
  const ctaLabel = onRoleScreen
    ? productOnboardingCopy.cta.next
    : currentStep?.isFinal
      ? isReplay
        ? productOnboardingCopy.cta.close
        : productOnboardingCopy.cta.start
      : productOnboardingCopy.cta.next;

  const showBack = !onRoleScreen;
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    if (!useNativeHeader) return;
    // FAQ already has a header; without an explicit status-bar height the
    // nested cover modal inherits 0 and the chrome jumps into the island
    // after the first layout pass.
    navigation.setOptions({
      headerStatusBarHeight: insets.top,
      headerLeft: showBack
        ? () => <StackHeaderBackButton onPress={handleBack} />
        : () => <View style={styles.headerPlaceholder} />,
      headerRight: () => (
        <Pressable
          onPress={handleSkip}
          disabled={busy}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={productOnboardingCopy.cta.skip}
          style={styles.headerSkip}
        >
          <Text style={[styles.headerSkipText, busy && styles.skipTextDisabled]}>
            {productOnboardingCopy.cta.skip}
          </Text>
        </Pressable>
      ),
    });
  }, [
    busy,
    handleBack,
    handleSkip,
    insets.top,
    navigation,
    showBack,
    useNativeHeader,
  ]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={useNativeHeader ? ["bottom", "left", "right"] : undefined}
    >
      {useNativeHeader ? null : (
        <View style={styles.topBar}>
          {showBack ? (
            <StackHeaderBackButton onPress={handleBack} />
          ) : (
            <View style={styles.headerPlaceholder} />
          )}
          <Pressable
            onPress={handleSkip}
            disabled={busy}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={productOnboardingCopy.cta.skip}
            style={styles.skipHit}
          >
            <Text style={[styles.skipText, busy && styles.skipTextDisabled]}>
              {productOnboardingCopy.cta.skip}
            </Text>
          </Pressable>
        </View>
      )}

      {!onRoleScreen && progress ? (
        <ProgressBar {...progress} reduceMotion={reduceMotion} />
      ) : (
        <View style={styles.progressSpacer} />
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {onRoleScreen ? (
          <RoleSelectScreen
            selectedRole={selectedRole}
            onSelect={setSelectedRole}
            reduceMotion={reduceMotion}
          />
        ) : currentStep ? (
          <GuideStepScreen step={currentStep} reduceMotion={reduceMotion} />
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <GuideCta
          label={ctaLabel}
          onPress={handleNext}
          disabled={ctaDisabled}
          loading={busy}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    minHeight: 44,
  },
  headerPlaceholder: {
    width: 44,
    height: 44,
  },
  headerSkip: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    // Keep the liquid-glass pill compact — minHeight 44 stretched it and
    // left the label optically low inside the capsule.
    paddingVertical: Platform.OS === "ios" ? 6 : 8,
  },
  headerSkipText: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.text.secondary,
    ...Platform.select({
      ios: {
        // SF Pro sits optically low in a short capsule; nudge up a hair.
        marginTop: -1,
      },
      android: {
        includeFontPadding: false,
        textAlignVertical: "center" as const,
      },
      default: {},
    }),
  },
  skipHit: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    fontSize: 17,
    lineHeight: 22,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  skipTextDisabled: {
    opacity: 0.5,
  },
  progressSpacer: {
    height: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
});
