import { StyleSheet, View } from "react-native";
import { usePathname, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CircleChromeButton from "@/src/components/ui/circle-chrome-button";
import { colors, spacing } from "@/src/theme";
import { SIGN_UP_STEPS } from "@/src/validation";
import { StepProgress } from "./step-progress";

export const SIGN_UP_CHROME_HEIGHT = 56;

export function signUpStepIndex(pathname: string) {
  const index = SIGN_UP_STEPS.findIndex(
    (step) => pathname === step.route || pathname.endsWith(step.route),
  );
  return index < 0 ? 0 : index;
}

export function SignUpChrome() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const index = signUpStepIndex(pathname);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingTop: insets.top }]}
    >
      <BlurView intensity={28} tint="light" style={styles.blur}>
        <View style={styles.row}>
          <CircleChromeButton
            accessibilityLabel="Wstecz"
            onPress={() => {
              Haptics.selectionAsync();
              if (router.canGoBack()) {
                router.back();
                return;
              }
              router.replace("/sign-in");
            }}
          >
            <ChevronLeft
              size={26}
              color={colors.text.primary}
              strokeWidth={2.25}
              style={styles.chevron}
            />
          </CircleChromeButton>
          <View style={styles.progress}>
            <StepProgress index={index} />
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  blur: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.status.border,
    backgroundColor: "rgba(246,247,244,0.72)",
  },
  row: {
    minHeight: SIGN_UP_CHROME_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chevron: {
    marginLeft: -1,
  },
  progress: {
    flex: 1,
  },
});
