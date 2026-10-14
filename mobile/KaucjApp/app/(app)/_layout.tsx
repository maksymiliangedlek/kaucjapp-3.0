import { Stack } from "expo-router";
import { useAuthStore } from "@/src/auth/auth-store";
import { usePendingProductOnboardingSync } from "@/src/components/product-onboarding/use-pending-onboarding-sync";

export default function AppLayout() {
  const needsProductOnboarding = useAuthStore(
    (state) =>
      !!state.user && state.user.productOnboardingCompleted === false,
  );
  const isAuthenticated = useAuthStore(
    (state) => !!state.user && !!state.accessToken,
  );
  usePendingProductOnboardingSync(isAuthenticated && !needsProductOnboarding);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!needsProductOnboarding}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Screen
        name="product-onboarding"
        options={{ gestureEnabled: false, animation: "fade" }}
      />
    </Stack>
  );
}
