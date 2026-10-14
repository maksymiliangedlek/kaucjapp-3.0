import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  useMyDailyStats,
  useMyPeriodStats,
} from "@/src/api/hooks/use-user-stats";
import { daysIntoMonth } from "@/src/lib/start-utils";
import { colors, rounded, spacing } from "@/src/theme";
import SectionError from "../section-error";
import SectionSkeleton from "../section-skeleton";

export default function MonthlyReturnedCard() {
  const days = daysIntoMonth();
  const period = useMyPeriodStats(days);
  const daily = useMyDailyStats(Math.min(days, 14));

  const bars = useMemo(() => {
    const series = daily.data?.days ?? [];
    if (series.length === 0) {
      const total = period.data?.returnedTotalCount ?? 0;
      return Array.from({ length: 7 }, (_, i) =>
        i === 6 ? total : Math.max(0, Math.floor(total / 7)),
      );
    }
    return series.map((d) => d.returnedTotalCount);
  }, [daily.data, period.data]);

  const max = Math.max(1, ...bars);
  const total =
    period.data?.returnedTotalCount ??
    bars.reduce((sum, n) => sum + n, 0);

  if (period.isLoading && daily.isLoading) {
    return (
      <View style={styles.pad}>
        <SectionSkeleton rows={1} />
      </View>
    );
  }

  if (period.isError && daily.isError) {
    return (
      <View style={styles.pad}>
        <SectionError
          message="Nie udało się wczytać statystyk."
          onRetry={() => {
            period.refetch();
            daily.refetch();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.pad}>
      <View
        style={styles.card}
        accessibilityRole="summary"
        accessibilityLabel={`Oddano w tym miesiącu: ${total} sztuk`}
      >
        <View style={styles.header}>
          <Text style={styles.label}>Oddano w tym miesiącu</Text>
          <Text style={styles.value}>{total} szt.</Text>
        </View>
        <View style={styles.chart} accessibilityElementsHidden>
          {bars.map((v, i) => (
            <View key={i} style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  { height: Math.max(6, (v / max) * 52) },
                ]}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.status.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  value: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary.base,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 56,
    gap: 4,
  },
  barTrack: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    backgroundColor: colors.primary.base,
    opacity: 0.85,
    minHeight: 4,
  },
});
