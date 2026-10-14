import React from "react";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import StackHeaderBackButton from "./stack-header-back-button";

type StackHeaderBackProps = {
  /** Used when the stack has no history (e.g. deep link / tab reset). */
  fallbackHref?: Href;
  /**
   * Leaf cover screens (FAQ, settings): dismiss the modal instead of
   * `back()`, which can pop past the tab root after a bad stack state.
   */
  preferDismiss?: boolean;
};

/**
 * Circular liquid-glass back (iOS 26 wraps headerLeft).
 * Prefer stack `back()` when possible so stacked cover screens
 * (attention → detail → chat) pop one level. Only then dismiss / fallback.
 */
export default function StackHeaderBack({
  fallbackHref,
  preferDismiss = false,
}: StackHeaderBackProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const returnToRaw = params.returnTo;
  const returnTo = Array.isArray(returnToRaw) ? returnToRaw[0] : returnToRaw;

  return (
    <StackHeaderBackButton
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
        if (preferDismiss && router.canDismiss()) {
          router.dismiss();
          return;
        }
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
