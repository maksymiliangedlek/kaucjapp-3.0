import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { AuthButton } from "@/src/components/auth/auth-button";
import { colors, spacing } from "@/src/theme";
import { SIGN_UP_CHROME_HEIGHT } from "./sign-up-chrome";

type Props = {
  title: string;
  subtitle: string;
  continueLabel?: string;
  onContinue: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
};

export function SignUpStepLayout({
  title,
  subtitle,
  continueLabel = "Dalej",
  onContinue,
  loading,
  disabled,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Animated.View
        entering={
          reduceMotion
            ? undefined
            : FadeInDown.springify().damping(22).stiffness(280).mass(0.85)
        }
        style={[
          styles.body,
          { paddingTop: insets.top + SIGN_UP_CHROME_HEIGHT + spacing.lg },
        ]}
      >
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.field}>{children}</View>
      </Animated.View>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}
      >
        <AuthButton
          label={continueLabel}
          onPress={onContinue}
          isLoading={loading}
          disabled={disabled}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: colors.text.primary,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 17,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  field: {
    marginTop: spacing.xxl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
  },
});
