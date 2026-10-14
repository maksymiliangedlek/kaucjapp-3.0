import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Czat",
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
