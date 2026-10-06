import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect } from "react";
import { offerKeys } from "@/src/api/hooks/use-offer";
import { userKeys } from "@/src/api/hooks/use-user";
import { PushData } from "@/src/types/notification";
import { registerForPushNotifications } from "./push-registration";

const CHAT_PATHNAMES = ["/profile/offers/chat", "/profile/bookings/chat"];

// Offer whose chat is on screen; its message pushes are not shown as banners.
let openChatOfferId: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data as Partial<PushData>;
    const isOpenChat =
      data.type === "OFFER_MESSAGE" && data.offerId === openChatOfferId;
    return {
      shouldShowBanner: !isOpenChat,
      shouldShowList: !isOpenChat,
      shouldPlaySound: !isOpenChat,
      shouldSetBadge: false,
    };
  },
});

const openNotification = (data: Partial<PushData>) => {
  const { type, offerId, role } = data;
  if (!type) return;

  if (type === "USER_REVIEW") {
    router.push("/profile");
    return;
  }
  if (!offerId) return;

  const isCreator = role === "CREATOR";
  if (type === "OFFER_MESSAGE") {
    router.push({
      pathname: isCreator ? "/profile/offers/chat" : "/profile/bookings/chat",
      params: { offerId },
    });
    return;
  }
  router.push({
    pathname: isCreator ? "/profile/offers/[id]" : "/profile/bookings/[id]",
    params: { id: offerId },
  });
};

// Registers the device for push, keeps cached data fresh when a push arrives and opens the related screen on tap.
export const usePushNotifications = (isAuthenticated: boolean) => {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { offerId } = useGlobalSearchParams<{ offerId?: string }>();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    openChatOfferId = CHAT_PATHNAMES.includes(pathname)
      ? (offerId ?? null)
      : null;
  }, [pathname, offerId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    registerForPushNotifications();

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { type } = notification.request.content.data as Partial<PushData>;
        if (type === "USER_REVIEW") {
          queryClient.invalidateQueries({ queryKey: userKeys.all });
        } else if (type) {
          queryClient.invalidateQueries({ queryKey: offerKeys.all });
        }
      },
    );
    return () => subscription.remove();
  }, [isAuthenticated, queryClient]);

  // Also covers the cold start from a tapped notification: the last response is replayed once signed in.
  useEffect(() => {
    if (!isAuthenticated || !lastResponse) return;
    if (
      lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      return;
    }
    openNotification(
      lastResponse.notification.request.content.data as Partial<PushData>,
    );
    Notifications.clearLastNotificationResponse();
  }, [isAuthenticated, lastResponse]);
};
