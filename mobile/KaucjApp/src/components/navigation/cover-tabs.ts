import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

/**
 * Present over NativeTabs so the bottom bar is not visible on “pushed”
 * screens (chat, settings, offer detail, …). Uses a right slide so it still
 * feels like a normal stack push rather than a sheet.
 */
export const coverTabsScreenOptions: NativeStackNavigationOptions = {
  presentation: "fullScreenModal",
  animation: "slide_from_right",
};
