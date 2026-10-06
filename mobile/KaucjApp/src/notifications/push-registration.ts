import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  registerPushToken,
  unregisterPushToken,
} from "@/src/api/hooks/use-push-token";

// Only iOS is configured (APNs); Android needs FCM credentials first, see deploy/README.md.
// Push tokens are not issued on simulators.
const isPushSupported = Platform.OS === "ios" && Device.isDevice;

let registeredToken: string | null = null;

const getExpoPushToken = async (): Promise<string | null> => {
  const current = await Notifications.getPermissionsAsync();
  const status =
    current.status === "granted"
      ? current.status
      : (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) return null;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
};

// Called for the signed-in user; the backend moves the token to the current user if the device was used by someone else.
export const registerForPushNotifications = async () => {
  if (!isPushSupported) return;
  try {
    const token = await getExpoPushToken();
    if (!token) return;
    await registerPushToken(token, "ios");
    registeredToken = token;
  } catch (error) {
    console.warn("[Push] Registration failed.", error);
  }
};

// Must run before the access token is purged, the endpoint needs the user's session.
export const unregisterFromPushNotifications = async () => {
  const token = registeredToken;
  if (!token) return;
  registeredToken = null;
  try {
    await unregisterPushToken(token);
  } catch (error) {
    console.warn("[Push] Unregistering failed.", error);
  }
};
