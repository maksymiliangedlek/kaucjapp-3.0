import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import OfferSatusPill from "@/src/components/ui/offer-status-pill";
import { useConfirmOffer } from "@/src/api/hooks/use-offer";
import { colors, rounded, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import {
  formatOfferItemsLabel,
  formatRemainingLabel,
  getAttentionExpiresAt,
  isAttentionUrgent,
} from "@/src/lib/start-utils";
import { openMapsNavigation } from "@/src/lib/open-maps-navigation";
import {
  AttentionPerspective,
  chatPathForPerspective,
  detailPathForPerspective,
} from "@/src/hooks/use-start-attention";

interface AttentionCardProps {
  offer: Offer;
  perspective: AttentionPerspective;
  counterpartName?: string;
  /** Stack preview: info only, no local CTAs (avoids gesture conflicts). */
  preview?: boolean;
}

export default function AttentionCard({
  offer,
  perspective,
  counterpartName,
  preview = false,
}: AttentionCardProps) {
  const router = useRouter();
  const confirm = useConfirmOffer(offer.offerId);
  const expiresAt = getAttentionExpiresAt(offer);
  const urgent = isAttentionUrgent(offer);
  const isReserved = offer.status === "RESERVED";
  const isPending = offer.status === "PENDING_CONFIRMATION";

  const openDetail = () => {
    Haptics.selectionAsync();
    router.push(detailPathForPerspective(perspective, offer));
  };

  const openChat = () => {
    Haptics.selectionAsync();
    router.push(chatPathForPerspective(perspective, offer.offerId));
  };

  const onNavigate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openMapsNavigation(offer.latitude, offer.longitude, offer.pickupAddress);
  };

  const onConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Potwierdź odbiór",
      "Czy na pewno chcesz potwierdzić przekazanie opakowań?",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Potwierdź",
          onPress: () => {
            confirm.mutate(undefined as void, {
              onError: (e) => Alert.alert("Błąd", e.message),
            });
          },
        },
      ],
    );
  };

  const a11yLabel = [
    offer.status === "RESERVED" ? "Zarezerwowana" : "Czeka na potwierdzenie",
    formatOfferItemsLabel(offer),
    offer.pickupAddress,
    expiresAt ? formatRemainingLabel(expiresAt) : "",
    counterpartName ? `Kurier ${counterpartName}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <Pressable
      style={[styles.card, urgent && styles.cardUrgent]}
      onPress={preview ? undefined : openDetail}
      disabled={preview}
      accessibilityRole={preview ? undefined : "button"}
      accessibilityLabel={a11yLabel}
    >
      <OfferSatusPill status={offer.status} />
      <Text style={styles.title}>{formatOfferItemsLabel(offer)}</Text>
      {perspective === "creator" && counterpartName ? (
        <Text style={styles.meta}>{counterpartName}</Text>
      ) : null}
      <Text style={styles.address} numberOfLines={2}>
        {offer.pickupAddress}
      </Text>
      {expiresAt ? (
        <Text style={[styles.timer, urgent && styles.timerUrgent]}>
          {formatRemainingLabel(expiresAt)}
        </Text>
      ) : null}

      {preview ? null : (
        <View style={styles.actions}>
          {isReserved ? (
            <>
              <ActionBtn label="Czat" outline onPress={openChat} />
              {perspective === "collector" ? (
                <ActionBtn label="Nawiguj" onPress={onNavigate} />
              ) : (
                <ActionBtn label="Szczegóły" onPress={openDetail} />
              )}
            </>
          ) : null}
          {isPending ? (
            <ActionBtn
              label={
                perspective === "creator" ? "Potwierdź odbiór" : "Potwierdź"
              }
              onPress={onConfirm}
              disabled={confirm.isPending}
            />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

function ActionBtn({
  label,
  onPress,
  outline,
  disabled,
}: {
  label: string;
  onPress: () => void;
  outline?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={(e) => {
        e.stopPropagation?.();
        onPress();
      }}
      disabled={disabled}
      style={[
        styles.btn,
        outline ? styles.btnOutline : styles.btnFill,
        disabled && styles.btnDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.btnText, outline && styles.btnTextOutline]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.status.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardUrgent: {
    borderColor: colors.status.warning,
    backgroundColor: "#FFFBEB",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  meta: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary.dark,
  },
  address: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  timer: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary.dark,
    marginTop: 2,
  },
  timerUrgent: {
    color: "#92400E",
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
    paddingHorizontal: spacing.sm,
  },
  btnFill: {
    backgroundColor: colors.primary.base,
  },
  btnOutline: {
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.primary.base,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: colors.text.white,
    fontWeight: "700",
    fontSize: 14,
  },
  btnTextOutline: {
    color: colors.primary.base,
  },
});
