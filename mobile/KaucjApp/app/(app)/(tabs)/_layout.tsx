import { colors } from "@/src/theme";

import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabsLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeTabs>
        <NativeTabs.Trigger name="start">
          <Label selectedStyle={{ color: colors.primary.base }}>Start</Label>
          <Icon
            selectedColor={colors.primary.base}
            sf={{ default: "house", selected: "house.fill" }}
            drawable="home"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="home">
          <Label selectedStyle={{ color: colors.primary.base }}>Mapa</Label>
          <Icon
            selectedColor={colors.primary.base}
            sf={{ default: "map", selected: "map.fill" }}
            drawable="map.fill"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="create">
          <Label selectedStyle={{ color: colors.primary.base }}>Dodaj</Label>
          <Icon
            selectedColor={colors.primary.base}
            sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
            drawable="plus.circle.fill"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="chat">
          <Label selectedStyle={{ color: colors.primary.base }}>Czat</Label>
          <Icon
            selectedColor={colors.primary.base}
            sf={{
              default: "bubble.left.and.bubble.right",
              selected: "bubble.left.and.bubble.right.fill",
            }}
            drawable="chat"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Label selectedStyle={{ color: colors.primary.base }}>Profil</Label>
          <Icon
            selectedColor={colors.primary.base}
            sf={{ default: "person", selected: "person.fill" }}
            drawable="person.fill"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </GestureHandlerRootView>
  );
}
