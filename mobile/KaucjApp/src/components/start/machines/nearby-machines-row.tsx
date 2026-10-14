import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSearchMachines } from "@/src/api/hooks/use-machines";
import {
  bboxAround,
  formatDistance,
  haversineMeters,
} from "@/src/lib/start-utils";
import { colors, rounded, spacing } from "@/src/theme";
import { DepositMachine } from "@/src/types";
import SectionError from "../section-error";
import SectionSkeleton from "../section-skeleton";

interface NearbyMachinesRowProps {
  latitude: number;
  longitude: number;
  enabled?: boolean;
}

export default function NearbyMachinesRow({
  latitude,
  longitude,
  enabled = true,
}: NearbyMachinesRowProps) {
  const bbox = useMemo(
    () => bboxAround(latitude, longitude, 0.04),
    [latitude, longitude],
  );
  const query = useSearchMachines(bbox, enabled);
  const router = useRouter();

  const machines = useMemo(() => {
    const list = query.data ?? [];
    return [...list]
      .map((m) => ({
        machine: m,
        distance: haversineMeters(
          latitude,
          longitude,
          m.latitude,
          m.longitude,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);
  }, [query.data, latitude, longitude]);

  if (!enabled) return null;

  if (query.isLoading) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Kaucjomaty w Twojej okolicy</Text>
        <SectionSkeleton rows={1} />
      </View>
    );
  }

  if (query.isError) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Kaucjomaty w Twojej okolicy</Text>
        <SectionError
          message="Nie udało się wczytać kaucjomatów."
          onRetry={() => query.refetch()}
        />
      </View>
    );
  }

  if (machines.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Kaucjomaty w Twojej okolicy</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {machines.map(({ machine, distance }) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            distance={distance}
            onPress={() =>
              router.push({
                pathname: "/(app)/(tabs)/home",
                params: { filter: "machines" },
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

function MachineCard({
  machine,
  distance,
  onPress,
}: {
  machine: DepositMachine;
  distance: number;
  onPress: () => void;
}) {
  const today = ((new Date().getDay() + 6) % 7) + 1; // Mon=1
  const hours = machine.openingHours?.find((h) => h.dayOfWeek === today);
  const hoursLabel = !hours
    ? "Godziny niedostępne"
    : hours.isClosed
      ? "Zamknięte dziś"
      : `${hours.openTime?.slice(0, 5)}–${hours.closeTime?.slice(0, 5)}`;

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${machine.networkName}, ${formatDistance(distance)}, ${hoursLabel}`}
    >
      <Text style={styles.name} numberOfLines={1}>
        {machine.networkName}
      </Text>
      <Text style={styles.address} numberOfLines={2}>
        {machine.address}
      </Text>
      <Text style={styles.distance}>{formatDistance(distance)}</Text>
      <Text style={styles.hours}>{hoursLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  card: {
    width: 200,
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.status.border,
    padding: spacing.md,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  address: {
    fontSize: 12,
    color: colors.text.secondary,
    minHeight: 32,
  },
  distance: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary.base,
    marginTop: 4,
  },
  hours: {
    fontSize: 12,
    color: colors.text.muted,
  },
});
