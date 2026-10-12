import { Redirect } from "expo-router";
import { useAuthStore } from "@/src/auth/auth-store";
import { getDefaultRouteForAppRole } from "@/src/lib/map-user";

export default function AppIndex() {
  const user = useAuthStore((state) => state.user);

  if (user && user.productOnboardingCompleted === false) {
    return <Redirect href="/product-onboarding" />;
  }

  return <Redirect href={getDefaultRouteForAppRole(user?.appRole)} />;
}
