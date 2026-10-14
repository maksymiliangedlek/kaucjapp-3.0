import { Stack } from "expo-router";
import { coverTabsScreenOptions } from "@/src/components/navigation/cover-tabs";
import StackHeaderBack from "@/src/components/navigation/stack-header-back";

const coverDetail = {
  ...coverTabsScreenOptions,
  headerLargeTitleEnabled: false,
  headerBackButtonDisplayMode: "minimal" as const,
  headerLeft: () => <StackHeaderBack />,
};

const coverChat = {
  ...coverDetail,
  headerTitle: "Czat",
  headerTransparent: true,
  headerShadowVisible: false,
};

export default function StartLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, headerLargeTitleEnabled: false }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          ...coverTabsScreenOptions,
          headerTitle: "Powiadomienia",
          headerLargeTitleEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerShadowVisible: false,
          headerLeft: () => (
            <StackHeaderBack fallbackHref="/(app)/(tabs)/start" />
          ),
        }}
      />
      <Stack.Screen
        name="attention"
        options={{
          ...coverTabsScreenOptions,
          headerTitle: "Wymaga uwagi",
          headerLargeTitleEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerShadowVisible: false,
          headerLeft: () => (
            <StackHeaderBack fallbackHref="/(app)/(tabs)/start" />
          ),
        }}
      />

      <Stack.Screen
        name="offers/[id]"
        options={{ ...coverDetail, headerTitle: "Szczegóły oferty" }}
      />
      <Stack.Screen name="offers/chat" options={coverChat} />
      <Stack.Screen
        name="offers/complaint"
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
        name="offers/confirmation"
        options={{
          headerShown: false,
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen
        name="offers/profile-details-sheet"
        options={{
          headerShown: false,
          headerTransparent: true,
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.8, 1],
        }}
      />

      <Stack.Screen
        name="bookings/[id]"
        options={{ ...coverDetail, headerTitle: "Szczegóły rezerwacji" }}
      />
      <Stack.Screen name="bookings/chat" options={coverChat} />
      <Stack.Screen
        name="bookings/complaint"
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
        name="bookings/confirmation"
        options={{
          headerShown: false,
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen
        name="bookings/profile-details-sheet"
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
