import { Stack } from "expo-router";
import { coverTabsScreenOptions } from "@/src/components/navigation/cover-tabs";
import StackHeaderBack from "@/src/components/navigation/stack-header-back";

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
          headerLeft: () => <StackHeaderBack fallbackHref="/profile" />,
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
          headerLeft: () => <StackHeaderBack fallbackHref="/profile" />,
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
          headerLeft: () => <StackHeaderBack fallbackHref="/profile" />,
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
