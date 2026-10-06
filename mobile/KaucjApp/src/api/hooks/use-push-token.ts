import { apiClient } from "../api-client";
import { PushPlatform } from "@/src/types/notification";

export const registerPushToken = async (
  token: string,
  platform: PushPlatform,
) => {
  await apiClient.put("/notification/push-token", { token, platform });
};

export const unregisterPushToken = async (token: string) => {
  await apiClient.delete("/notification/push-token", { data: { token } });
};
