import React from "react";
import { StyleSheet, View } from "react-native";
import { HeaderBackButton } from "@react-navigation/elements";
import { ChevronLeft } from "lucide-react-native";
import { useRouter, type Href } from "expo-router";
import { colors } from "@/src/theme";

type StackHeaderBackProps = {
  /** Used when the stack has no history (e.g. deep link / tab reset). */
  fallbackHref?: Href;
};

/**
 * Circular liquid-glass back (iOS 26 wraps headerLeft). Custom backImage
 * avoids React Navigation’s default marginEnd that shifts the chevron left
 * inside the glass capsule.
 */
export default function StackHeaderBack({
  fallbackHref,
}: StackHeaderBackProps) {
  const router = useRouter();

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
            // Optical center: Lucide chevron is slightly left-heavy in its box
            style={styles.chevron}
          />
        </View>
      )}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
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
