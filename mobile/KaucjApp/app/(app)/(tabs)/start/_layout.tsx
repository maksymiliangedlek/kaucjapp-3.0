import { Stack } from "expo-router";
import StackHeaderBack from "@/src/components/navigation/stack-header-back";

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
          headerTitle: "Powiadomienia",
          headerLargeTitleEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerShadowVisible: false,
          headerLeft: () => <StackHeaderBack fallbackHref="/(app)/(tabs)/start" />,
        }}
      />
      <Stack.Screen
        name="attention"
        options={{
          headerTitle: "Wymaga uwagi",
          headerLargeTitleEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          headerShadowVisible: false,
          headerLeft: () => <StackHeaderBack fallbackHref="/(app)/(tabs)/start" />,
        }}
      />
    </Stack>
  );
}
