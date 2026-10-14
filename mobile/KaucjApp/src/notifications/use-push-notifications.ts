import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect } from "react";
import { offerKeys } from "@/src/api/hooks/use-offer";
import { notificationKeys } from "@/src/api/hooks/use-notifications";
import { userKeys } from "@/src/api/hooks/use-user";
import { PushData } from "@/src/types/notification";
import { registerForPushNotifications } from "./push-registration";

function isChatPathname(pathname: string) {
  return (
    pathname.includes("/offers/chat") ||
    pathname.includes("/bookings/chat") ||
    pathname.endsWith("/home/chat")
  );
}

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
  // Prefer Start-stack routes so NativeTabs does not pop nested screens.
  if (type === "OFFER_MESSAGE") {
    router.push({
      pathname: isCreator ? "/start/offers/chat" : "/start/bookings/chat",
      params: { offerId },
    });
    return;
  }
  router.push({
    pathname: isCreator ? "/start/offers/[id]" : "/start/bookings/[id]",
    params: { id: offerId },
  });
};

// Registers the device for push, keeps cached data fresh when a push arrives and opens the related screen on tap.
// Skip registration until product onboarding is done so the first prompt can happen in-context (guide A2).
export const usePushNotifications = (
  isAuthenticated: boolean,
  productOnboardingCompleted: boolean,
) => {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { offerId } = useGlobalSearchParams<{ offerId?: string }>();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    openChatOfferId = isChatPathname(pathname) ? (offerId ?? null) : null;
  }, [pathname, offerId]);

  useEffect(() => {
    if (!isAuthenticated || !productOnboardingCompleted) return;
    registerForPushNotifications();

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { type } = notification.request.content.data as Partial<PushData>;
        if (type === "USER_REVIEW") {
          queryClient.invalidateQueries({ queryKey: userKeys.all });
        } else if (type) {
          queryClient.invalidateQueries({ queryKey: offerKeys.all });
        }
        if (type) {
          queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        }
      },
    );
    return () => subscription.remove();
  }, [isAuthenticated, productOnboardingCompleted, queryClient]);

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
