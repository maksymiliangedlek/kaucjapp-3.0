import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api-client";

export type PeriodStats = {
  userId: number;
  periodDays: number;
  fromDate: string;
  toDate: string;
  returnedBottleCount: number;
  returnedCanCount: number;
  returnedTotalCount: number;
  collectedBottleCount: number;
  collectedCanCount: number;
  collectedTotalCount: number;
};

export type DailyStatsResponse = {
  days: { date: string; returnedTotalCount: number }[];
};

export const statsKeys = {
  all: ["user-stats"] as const,
  period: (days: number) => [...statsKeys.all, "period", days] as const,
  daily: (days: number) => [...statsKeys.all, "daily", days] as const,
};

export const useMyPeriodStats = (days: number) => {
  return useQuery({
    queryKey: statsKeys.period(days),
    queryFn: async () => {
      const { data } = await apiClient.get<PeriodStats>("/user/me/stats/period", {
        params: { days },
      });
      return data;
    },
  });
};

export const useMyDailyStats = (days: number) => {
  return useQuery({
    queryKey: statsKeys.daily(days),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<DailyStatsResponse>(
          "/user/me/stats/daily",
          { params: { days } },
        );
        return data;
      } catch {
        return { days: [] } satisfies DailyStatsResponse;
      }
    },
    retry: false,
  });
};
