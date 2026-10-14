import React from "react";
import { StyleSheet, View } from "react-native";
import { HeaderBackButton } from "@react-navigation/elements";
import { ChevronLeft } from "lucide-react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { colors } from "@/src/theme";

type StackHeaderBackProps = {
  /** Used when the stack has no history (e.g. deep link / tab reset). */
  fallbackHref?: Href;
};

/**
 * Circular liquid-glass back (iOS 26 wraps headerLeft).
 * Prefer stack `back()` when possible so stacked cover screens
 * (attention → detail → chat) pop one level. Only then dismiss / fallback.
 */
export default function StackHeaderBack({
  fallbackHref,
}: StackHeaderBackProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const returnToRaw = params.returnTo;
  const returnTo = Array.isArray(returnToRaw) ? returnToRaw[0] : returnToRaw;

  return (
    <HeaderBackButton
      tintColor={colors.text.primary}
      displayMode="minimal"
      backImage={({ tintColor }) => (
        <View style={styles.iconWrap}>
          <ChevronLeft
            size={28}
            color={tintColor ?? colors.text.primary}
            strokeWidth={2.25}
            style={styles.chevron}
          />
        </View>
      )}
      onPress={() => {
        if (returnTo) {
          const href = returnTo as Href;
          if (router.canDismiss()) {
            router.dismissTo(href);
          } else {
            router.replace(href);
          }
          return;
        }
        // Prefer back over dismiss so nested cover screens don't wipe the stack.
        if (router.canGoBack()) {
          router.back();
          return;
        }
        if (router.canDismiss()) {
          router.dismiss();
          return;
        }
        if (fallbackHref) {
          router.replace(fallbackHref);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    marginLeft: -1,
  },
});
