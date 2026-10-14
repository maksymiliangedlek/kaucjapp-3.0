import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/auth/auth-store";
import { offerKeys, useSearchOffers } from "@/src/api/hooks/use-offer";
import { machineKeys } from "@/src/api/hooks/use-machines";
import { statsKeys } from "@/src/api/hooks/use-user-stats";
import {
  notificationKeys,
  useUnreadNotificationCount,
} from "@/src/api/hooks/use-notifications";
import { useStartAttention } from "@/src/hooks/use-start-attention";
import { useStartLocation } from "@/src/hooks/use-start-location";
import {
  bboxAround,
  formatOfferItemsLabel,
  haversineMeters,
} from "@/src/lib/start-utils";
import {
  startContentSectionOrder,
  StartContentSection,
} from "@/src/lib/start-section-order";
import { colors, spacing } from "@/src/theme";
import StartHeader from "./start-header";
import QuickActions from "./quick-actions";
import AttentionSection from "./attention/attention-section";
import CollectorHero from "./hero/collector-hero";
import NearbyMachinesRow from "./machines/nearby-machines-row";
import ActiveOffersSection from "./offers/active-offers-section";
import MonthlyReturnedCard from "./stats/monthly-returned-card";

export default function StartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const appRole = user?.appRole ?? null;

  const location = useStartLocation();
  const coords = location.coords ?? {
    latitude: 50.0614,
    longitude: 19.9373,
  };
  const bbox = useMemo(
    () => bboxAround(coords.latitude, coords.longitude),
    [coords.latitude, coords.longitude],
  );

  const nearby = useSearchOffers(bbox, true);
  const attention = useStartAttention();
  const unread = useUnreadNotificationCount(true);
  const sectionOrder = useMemo(
    () => startContentSectionOrder(appRole),
    [appRole],
  );

  const nearestLabel = useMemo(() => {
    const offers = nearby.data ?? [];
    if (offers.length === 0) return null;
    const nearest = [...offers].sort(
      (a, b) =>
        haversineMeters(
          coords.latitude,
          coords.longitude,
          a.latitude,
          a.longitude,
        ) -
        haversineMeters(
          coords.latitude,
          coords.longitude,
          b.latitude,
          b.longitude,
        ),
    )[0];
    const dist = haversineMeters(
      coords.latitude,
      coords.longitude,
      nearest.latitude,
      nearest.longitude,
    );
    const distLabel =
      dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(1)} km`;
    return `${formatOfferItemsLabel(nearest)} · ${distLabel}`;
  }, [nearby.data, coords.latitude, coords.longitude]);

  const [refreshing, setRefreshing] = React.useState(false);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: offerKeys.all }),
      queryClient.invalidateQueries({ queryKey: machineKeys.all }),
      queryClient.invalidateQueries({ queryKey: statsKeys.all }),
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
      attention.refetch(),
    ]);
    setRefreshing(false);
  }, [queryClient, attention]);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: offerKeys.mine() });
      queryClient.invalidateQueries({ queryKey: offerKeys.reserved() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
    }, [queryClient]),
  );

  const renderContentSection = (id: StartContentSection) => {
    if (id === "nearby") {
      return (
        <CollectorHero
          key="nearby"
          offerCount={nearby.data?.length ?? 0}
          latitude={coords.latitude}
          longitude={coords.longitude}
          nearestLabel={nearestLabel}
          hasLocationPermission={location.permissionGranted}
          onRequestLocation={location.requestPermission}
          isLoading={location.isLoading || nearby.isLoading}
          isError={nearby.isError}
          onRetry={() => nearby.refetch()}
          isEmpty={!nearby.isLoading && (nearby.data?.length ?? 0) === 0}
        />
      );
    }
    return <ActiveOffersSection key="activeOffers" />;
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor={colors.primary.base}
          />
        }
      >
        <StartHeader
          firstName={user?.firstName ?? ""}
          appRole={appRole}
          unreadCount={unread.data ?? 0}
        />

        <AttentionSection
          items={attention.items}
          isLoading={attention.isLoading}
          isError={attention.isError}
          onRetry={attention.refetch}
        />

        <QuickActions appRole={appRole} />

        {sectionOrder.map(renderContentSection)}

        <NearbyMachinesRow
          latitude={coords.latitude}
          longitude={coords.longitude}
          enabled={!location.isLoading}
        />

        <MonthlyReturnedCard />

        {(nearby.data?.length ?? 0) > 0 ? (
          <Pressable
            style={styles.linkRow}
            onPress={() => router.push("/(app)/(tabs)/home")}
            accessibilityRole="link"
            accessibilityLabel="Zobacz wszystkie oferty"
          >
            <Text style={styles.link}>Zobacz wszystkie oferty →</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  content: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  linkRow: {
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: "center",
  },
  link: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary.base,
  },
});
