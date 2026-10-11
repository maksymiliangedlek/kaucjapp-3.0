import { Pressable, StyleSheet, View } from "react-native";
import { usePathname, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/src/theme";
import { SIGN_UP_STEPS } from "@/src/validation";
import { StepProgress } from "./step-progress";

export const SIGN_UP_CHROME_HEIGHT = 52;

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
      <View style={styles.row}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Wstecz"
          style={styles.back}
        >
          <Feather name="chevron-left" size={28} color={colors.text.primary} />
        </Pressable>
        <View style={styles.progress}>
          <StepProgress index={index} />
        </View>
      </View>
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
  row: {
    height: SIGN_UP_CHROME_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.lg,
  },
  back: {
    width: 52,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  progress: {
    flex: 1,
  },
});
