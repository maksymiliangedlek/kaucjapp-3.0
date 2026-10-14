import { Stack } from "expo-router";
import { coverTabsScreenOptions } from "@/src/components/navigation/cover-tabs";
import StackHeaderBack from "@/src/components/navigation/stack-header-back";
import { colors } from "@/src/theme";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, headerLargeTitleEnabled: false }}
      />
      <Stack.Screen
        name="settings"
        options={{
          ...coverTabsScreenOptions,
          headerShown: true,
          headerLargeTitleEnabled: false,
          headerTitle: "Ustawienia",
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerLeft: () => (
            <StackHeaderBack fallbackHref="/profile" preferDismiss />
          ),
        }}
      />

      <Stack.Screen
        name="offers"
        options={{
          ...coverTabsScreenOptions,
          headerShown: false,
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Moje oferty",
        }}
      />
      <Stack.Screen
        name="bookings"
        options={{
          ...coverTabsScreenOptions,
          headerShown: false,
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Moje rezerwacje",
        }}
      />

      <Stack.Screen
        name="ranking"
        options={{
          ...coverTabsScreenOptions,
          headerShown: true,
          headerTitle: "Ranking",
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerLeft: () => (
            <StackHeaderBack fallbackHref="/profile" preferDismiss />
          ),
        }}
      />

      <Stack.Screen
        name="faq"
        options={{
          ...coverTabsScreenOptions,
          headerShown: true,
          headerTitle: "FAQ",
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerLeft: () => (
            <StackHeaderBack fallbackHref="/profile" preferDismiss />
          ),
        }}
      />

      <Stack.Screen
        name="product-onboarding"
        options={{
          // Same cover as FAQ so the guide stays edge-to-edge. A plain `card`
          // push on top of FAQ's fullScreenModal settles into a page-sheet
          // (grey strip + rounded top) after the first layout pass.
          ...coverTabsScreenOptions,
          headerShown: true,
          headerTitle: "",
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          headerStyle: { backgroundColor: colors.background.main },
          contentStyle: { backgroundColor: colors.background.main },
          gestureEnabled: false,
          animation: "fade",
        }}
      />

      <Stack.Screen
        name="stats"
        options={{
          headerShown: false,
          headerTitle: "Mój profil",
          headerLargeTitleEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.9, 1],
        }}
      />
    </Stack>
  );
}
