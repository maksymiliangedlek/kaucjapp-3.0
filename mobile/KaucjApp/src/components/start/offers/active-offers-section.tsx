import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useChangeOfferStatus, useMyOffers } from "@/src/api/hooks/use-offer";
import OfferSatusPill from "@/src/components/ui/offer-status-pill";
import { formatOfferItemsLabel } from "@/src/lib/start-utils";
import { colors, rounded, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import PeekStack, { PEEK_THRESHOLD } from "../peek-stack";
import SectionError from "../section-error";
import SectionSkeleton from "../section-skeleton";

export default function ActiveOffersSection() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useMyOffers();
  const openOffers = (data ?? []).filter((o) => o.status === "OPEN");

  if (isLoading) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Twoje aktywne oferty</Text>
        <SectionSkeleton rows={1} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Twoje aktywne oferty</Text>
        <SectionError
          message="Nie udało się wczytać aktywnych ofert."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  if (openOffers.length === 0) return null;

  const stacked = openOffers.length > PEEK_THRESHOLD;
  const shown = stacked ? openOffers.slice(0, 3) : openOffers;

  return (
    <PeekStack
      title="Twoje aktywne oferty"
      count={openOffers.length}
      onOpenList={() => router.push("/(app)/(tabs)/profile/offers")}
      accessibilityLabel={`Twoje aktywne oferty, ${openOffers.length}`}
    >
      {shown.map((offer) => (
        <ActiveOfferCard
          key={offer.offerId}
          offer={offer}
          preview={stacked}
        />
      ))}
    </PeekStack>
  );
}

function ActiveOfferCard({
  offer,
  preview = false,
}: {
  offer: Offer;
  preview?: boolean;
}) {
  const router = useRouter();
  const changeStatus = useChangeOfferStatus();

  const openDetail = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: "/profile/offers/[id]",
      params: { id: String(offer.offerId) },
    });
  };

  const onCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Anuluj ofertę",
      "Czy na pewno chcesz anulować tę ofertę? Nie będzie już widoczna dla kurierów.",
      [
        { text: "Wróć", style: "cancel" },
        {
          text: "Anuluj ofertę",
          style: "destructive",
          onPress: () => {
            changeStatus.mutate(
              { offerId: offer.offerId, newStatus: "CANCELED" },
              {
                onError: (e) => Alert.alert("Błąd", e.message),
              },
            );
          },
        },
      ],
    );
  };

  return (
    <Pressable
      style={styles.card}
      onPress={preview ? undefined : openDetail}
      disabled={preview}
      accessibilityRole={preview ? undefined : "button"}
      accessibilityLabel={`${formatOfferItemsLabel(offer)}, Otwarta, widoczna na mapie`}
    >
      <OfferSatusPill status="OPEN" />
      <Text style={styles.cardTitle}>{formatOfferItemsLabel(offer)}</Text>
      <Text style={styles.meta} numberOfLines={2}>
        {offer.pickupAddress || "Widoczna na mapie"}
      </Text>
      {preview ? null : (
        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, styles.btnOutline]}
            onPress={(e) => {
              e.stopPropagation?.();
              openDetail();
            }}
            accessibilityRole="button"
            accessibilityLabel="Edytuj"
          >
            <Text style={[styles.btnText, styles.btnTextOutline]}>Edytuj</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnDanger]}
            onPress={(e) => {
              e.stopPropagation?.();
              onCancel();
            }}
            disabled={changeStatus.isPending}
            accessibilityRole="button"
            accessibilityLabel="Anuluj"
          >
            <Text style={styles.btnTextDanger}>Anuluj</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.status.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  meta: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    flex: 1,
    minHeight: 44,
    borderRadius: rounded.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary.base,
  },
  btnDanger: {
    borderWidth: 1.5,
    borderColor: colors.status.error,
  },
  btnText: {
    fontWeight: "700",
    fontSize: 14,
    color: colors.text.white,
  },
  btnTextOutline: {
    color: colors.primary.base,
  },
  btnTextDanger: {
    fontWeight: "700",
    fontSize: 14,
    color: colors.status.error,
  },
});
