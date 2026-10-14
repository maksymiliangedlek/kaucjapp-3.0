import { Linking, Platform } from "react-native";

/** Opens native maps navigation to the given coordinates. */
export async function openMapsNavigation(
  latitude: number,
  longitude: number,
  label?: string,
) {
  const encodedLabel = encodeURIComponent(label ?? "Punkt odbioru");
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodedLabel}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`;

  const can = await Linking.canOpenURL(url);
  if (can) {
    await Linking.openURL(url);
    return;
  }
  await Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
  );
}
