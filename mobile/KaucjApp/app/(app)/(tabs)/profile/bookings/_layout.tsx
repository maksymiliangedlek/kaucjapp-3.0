import { Stack } from "expo-router";
import { coverTabsScreenOptions } from "@/src/components/navigation/cover-tabs";
import StackHeaderBack from "@/src/components/navigation/stack-header-back";

export default function BookingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "Moje rezerwacje",
          headerLargeTitleEnabled: true,
          headerBackButtonDisplayMode: "minimal",
          headerLeft: () => <StackHeaderBack fallbackHref="/profile" />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          ...coverTabsScreenOptions,
          headerTitle: "Szczegóły rezerwacji",
          headerLargeTitleEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerLeft: () => <StackHeaderBack />,
        }}
      />

      <Stack.Screen
        name="chat"
        options={{
          ...coverTabsScreenOptions,
          headerTitle: "Czat",
          headerLargeTitleEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerShadowVisible: false,
          headerLeft: () => <StackHeaderBack />,
        }}
      />

      <Stack.Screen
        name="complaint"
        options={{
          headerTitle: "Zgłoś problem",
          headerLargeTitleEnabled: false,
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [1],
          contentStyle: { backgroundColor: "transparent" },
          headerLeft: () => <StackHeaderBack />,
        }}
      />

      <Stack.Screen
        name="confirmation"
        options={{
          headerShown: false,
          presentation: "transparentModal",
        }}
      />

      <Stack.Screen
        name="profile-details-sheet"
        options={{
          headerShown: false,
          headerTransparent: true,
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.8, 1],
        }}
      />
    </Stack>
  );
}
