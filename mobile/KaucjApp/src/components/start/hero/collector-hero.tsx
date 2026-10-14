import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MapPin, Search } from "lucide-react-native";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import MapPreviewSafe from "./map-preview-safe";
import SectionSkeleton from "../section-skeleton";
import SectionError from "../section-error";

interface CollectorHeroProps {
  offerCount: number;
  latitude: number;
  longitude: number;
  nearestLabel?: string | null;
  hasLocationPermission: boolean | null;
  onRequestLocation: () => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isEmpty?: boolean;
}

export default function CollectorHero({
  offerCount,
  latitude,
  longitude,
  nearestLabel,
  hasLocationPermission,
  onRequestLocation,
  isLoading,
  isError,
  onRetry,
  isEmpty,
}: CollectorHeroProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.pad}>
        <SectionSkeleton rows={1} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.pad}>
        <SectionError
          message="Nie udało się wczytać ofert w pobliżu."
          onRetry={onRetry}
        />
      </View>
    );
  }

  const openMap = () => {
    Haptics.selectionAsync();
    router.push("/(app)/(tabs)/home");
  };

  if (isEmpty) {
    return (
      <View style={styles.pad}>
        <View style={styles.card}>
          <View style={styles.emptyCircle}>
            <MapPin size={28} color={colors.primary.base} />
            <Search
              size={18}
              color={colors.primary.dark}
              style={styles.emptySearch}
            />
          </View>
          <Text style={styles.emptyTitle}>Brak ofert w pobliżu</Text>
          <Text style={styles.emptyBody}>
            Powiadomimy Cię, gdy pojawi się nowa.
          </Text>
          {hasLocationPermission === false ? (
            <Pressable style={styles.btn} onPress={onRequestLocation}>
              <Text style={styles.btnText}>Włącz lokalizację</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.btn} onPress={openMap}>
              <Text style={styles.btnText}>Zwiększ zasięg</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.pad}>
      <Pressable
        style={styles.card}
        onPress={openMap}
        accessibilityRole="button"
        accessibilityLabel={`${offerCount} ofert w pobliżu. Otwórz mapę`}
      >
        <Text style={styles.title}>
          {offerCount} {offerCount === 1 ? "oferta" : "ofert"} w pobliżu
        </Text>
        <Text style={styles.subtitle}>
          Zarezerwuj, zanim ktoś Cię uprzedzi
        </Text>

        {hasLocationPermission === false ? (
          <Pressable
            style={styles.locationBanner}
            onPress={onRequestLocation}
          >
            <Text style={styles.locationBannerText}>
              Włącz lokalizację, aby zobaczyć oferty bliżej Ciebie
            </Text>
          </Pressable>
        ) : null}

        <MapPreviewSafe latitude={latitude} longitude={longitude} height={120} />
        {nearestLabel ? (
          <View style={styles.chip}>
            <Text style={styles.chipText} numberOfLines={1}>
              {nearestLabel}
            </Text>
          </View>
        ) : null}

        <Pressable style={styles.btn} onPress={openMap}>
          <Text style={styles.btnText}>Otwórz mapę</Text>
        </Pressable>
      </Pressable>
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
    ...shadows.light,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  locationBanner: {
    backgroundColor: colors.primary.light,
    borderRadius: rounded.md,
    padding: spacing.sm,
  },
  locationBannerText: {
    fontSize: 13,
    color: colors.primary.dark,
    fontWeight: "600",
  },
  chip: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary.light,
    borderRadius: rounded.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    marginTop: -4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary.dark,
    maxWidth: 260,
  },
  btn: {
    backgroundColor: colors.primary.base,
    borderRadius: rounded.lg,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  btnText: {
    color: colors.text.white,
    fontWeight: "700",
    fontSize: 15,
  },
  emptyCircle: {
    alignSelf: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  emptySearch: {
    position: "absolute",
    right: 18,
    bottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
