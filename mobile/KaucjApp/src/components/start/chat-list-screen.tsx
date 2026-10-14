import React, { useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageCircle } from "lucide-react-native";
import { usePathname, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/src/auth/use-auth";
import { useMyOffers, useMyReservedOffers } from "@/src/api/hooks/use-offer";
import { withReturnTo } from "@/src/lib/nav-with-return";
import { formatOfferItemsLabel, isAttentionOffer } from "@/src/lib/start-utils";
import { colors, rounded, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import OfferSatusPill from "@/src/components/ui/offer-status-pill";

type ChatRow = {
  offer: Offer;
  perspective: "creator" | "collector";
};

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const myOffers = useMyOffers();
  const reserved = useMyReservedOffers();
  const appRole = user?.appRole;

  const rows = useMemo<ChatRow[]>(() => {
    const created = (myOffers.data ?? [])
      .filter(isAttentionOffer)
      .map((offer) => ({ offer, perspective: "creator" as const }));
    const booked = (reserved.data ?? [])
      .filter(isAttentionOffer)
      .map((offer) => ({ offer, perspective: "collector" as const }));
    const map = new Map<number, ChatRow>();
    [...created, ...booked].forEach((row) => {
      map.set(row.offer.offerId, row);
    });
    return [...map.values()].sort(
      (a, b) =>
        new Date(b.offer.updatedAt).getTime() -
        new Date(a.offer.updatedAt).getTime(),
    );
  }, [myOffers.data, reserved.data]);

  const emptyCta =
    appRole === "COLLECTOR"
      ? {
          label: "Zobacz oferty w okolicy",
          onPress: () => {
            Haptics.selectionAsync();
            router.push({
              pathname: "/(app)/(tabs)/home",
              params: { filter: "offers" },
            });
          },
        }
      : {
          // OFFERER, BOTH, or unset — primary path is listing
          label: "Wystaw ofertę",
          onPress: () => {
            Haptics.selectionAsync();
            router.push("/(app)/(tabs)/create");
          },
        };

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => String(item.offer.offerId)}
      contentContainerStyle={{
        paddingTop: spacing.md,
        paddingHorizontal: spacing.md,
        paddingBottom: insets.bottom + spacing.lg,
        flexGrow: 1,
        gap: spacing.sm,
      }}
      ListEmptyComponent={
        <View style={styles.empty}>
          <MessageCircle size={32} color={colors.text.muted} />
          <Text style={styles.emptyTitle}>Brak aktywnych rozmów</Text>
          <Text style={styles.emptyBody}>
            Czat pojawi się, gdy oferta zostanie zarezerwowana.
          </Text>
          <Pressable
            style={styles.emptyCta}
            onPress={emptyCta.onPress}
            accessibilityRole="button"
            accessibilityLabel={emptyCta.label}
          >
            <Text style={styles.emptyCtaText}>{emptyCta.label}</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() => {
            router.push(
              withReturnTo(
                {
                  pathname:
                    item.perspective === "creator"
                      ? "/profile/offers/chat"
                      : "/profile/bookings/chat",
                  params: { offerId: String(item.offer.offerId) },
                },
                pathname,
              ),
            );
          }}
          accessibilityRole="button"
          accessibilityLabel={`Czat: ${formatOfferItemsLabel(item.offer)}`}
        >
          <View style={styles.icon}>
            <MessageCircle size={20} color={colors.primary.dark} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.title}>
              {formatOfferItemsLabel(item.offer)}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {item.offer.pickupAddress}
            </Text>
            <OfferSatusPill status={item.offer.status} />
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
  emptyCta: {
    marginTop: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: rounded.xl,
    backgroundColor: colors.primary.base,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCtaText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.status.border,
    padding: spacing.md,
    alignItems: "flex-start",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  meta: {
    fontSize: 13,
    color: colors.text.secondary,
  },
});
