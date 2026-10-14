import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";

export type InboxNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  data: {
    offerId?: string;
    role?: string;
    type?: string;
  };
};

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  unread: () => [...notificationKeys.all, "unread"] as const,
};

export const useNotificationInbox = (enabled = true) => {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<InboxNotification[]>(
        "/notification/me",
        { params: { limit: 50 } },
      );
      return data;
    },
    enabled,
    retry: 1,
  });
};

export const useUnreadNotificationCount = (enabled = true) => {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{ count: number }>(
          "/notification/me/unread-count",
        );
        return data.count;
      } catch {
        return 0;
      }
    },
    enabled,
    retry: false,
    refetchInterval: 60_000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/notification/me/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/notification/me/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
