import { Appearance } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/src/api/query-client";
import { useAuth } from "@/src/auth/use-auth";
import { useAuthStore } from "@/src/auth/auth-store";
import { useAppBootstrap } from "@/src/auth/auth-storage-init";
import { useAppStore } from "@/src/state/app-store";
import OfflineBanner from "@/src/components/ui/offline-banner";
import { usePushNotifications } from "@/src/notifications/use-push-notifications";

// Force light UI for now (tabs, alerts, system chrome) regardless of OS setting.
Appearance.setColorScheme("light");

// COMENTED OUT FOR NOW, EXPO GO DOES NOT SUPPORT REACT QUERY PERSISTENCE, BUT THIS IS HOW IT WOULD LOOK LIKE
// import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
// import { queryClient, queryPersister } from "@/src/api/query-client";

function RootLayoutAuth() {
  const { isAuthenticated } = useAuth();
  const productOnboardingCompleted = useAuthStore(
    (state) => state.user?.productOnboardingCompleted !== false,
  );
  const hasSeenOnboarding = useAppStore((state) => state.hasSeenOnboarding);
  const { isReady } = useAppBootstrap();
  usePushNotifications(isAuthenticated, productOnboardingCompleted);

  if (!isReady) {
    return null; // The native splash screen is covering the app at this point
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={!hasSeenOnboarding}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={hasSeenOnboarding && !isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={hasSeenOnboarding && isAuthenticated}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <QueryClientProvider client={queryClient}>
        <RootLayoutAuth />
        <OfflineBanner />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
