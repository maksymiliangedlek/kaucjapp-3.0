import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { offerKeys, useMyOffers, useMyReservedOffers } from "@/src/api/hooks/use-offer";
import { Offer } from "@/src/types";
import {
  getAttentionExpiresAt,
  getAttentionUrgencyMs,
  isAttentionOffer,
} from "@/src/lib/start-utils";
import { parseDateToMs } from "@/src/lib/countdown";

export type AttentionPerspective = "creator" | "collector";

export type AttentionItem = {
  offer: Offer;
  perspective: AttentionPerspective;
};

/**
 * Merged attention list for Start: creator offers + collector bookings,
 * sorted by urgency only (role does not reorder this list).
 */
export function useStartAttention() {
  const queryClient = useQueryClient();
  const myOffers = useMyOffers();
  const reserved = useMyReservedOffers();
  const [, setTick] = useState(0);

  const items = useMemo(() => {
    const byId = new Map<number, AttentionItem>();

    for (const offer of (myOffers.data ?? []).filter(isAttentionOffer)) {
      byId.set(offer.offerId, { offer, perspective: "creator" });
    }
    for (const offer of (reserved.data ?? []).filter(isAttentionOffer)) {
      // Prefer creator perspective on collision (user owns the offer).
      if (!byId.has(offer.offerId)) {
        byId.set(offer.offerId, { offer, perspective: "collector" });
      }
    }

    return [...byId.values()].sort(
      (a, b) => getAttentionUrgencyMs(a.offer) - getAttentionUrgencyMs(b.offer),
    );
  }, [myOffers.data, reserved.data]);

  useEffect(() => {
    const nextExpiry = items
      .map((item) => getAttentionExpiresAt(item.offer))
      .filter((v): v is string => !!v)
      .map((v) => parseDateToMs(v))
      .filter((ms) => ms > Date.now())
      .sort((a, b) => a - b)[0];

    if (!nextExpiry) return;

    const delay = Math.min(nextExpiry - Date.now() + 250, 60_000);
    const id = setTimeout(() => {
      setTick((t) => t + 1);
      queryClient.invalidateQueries({ queryKey: offerKeys.mine() });
      queryClient.invalidateQueries({ queryKey: offerKeys.reserved() });
    }, Math.max(delay, 1000));
    return () => clearTimeout(id);
  }, [items, queryClient]);

  const visibleItems = useMemo(() => {
    const now = Date.now();
    return items.filter((item) => {
      const expires = getAttentionExpiresAt(item.offer);
      if (!expires) return true;
      return parseDateToMs(expires) > now;
    });
  }, [items]);

  return {
    items: visibleItems,
    isLoading: myOffers.isLoading || reserved.isLoading,
    isError: myOffers.isError || reserved.isError,
    refetch: async () => {
      await Promise.all([myOffers.refetch(), reserved.refetch()]);
    },
  };
}

export function chatPathForPerspective(
  perspective: AttentionPerspective,
  offerId: number,
) {
  if (perspective === "creator") {
    return {
      pathname: "/profile/offers/chat" as const,
      params: { offerId: String(offerId) },
    };
  }
  return {
    pathname: "/profile/bookings/chat" as const,
    params: { offerId: String(offerId) },
  };
}

export function detailPathForPerspective(
  perspective: AttentionPerspective,
  offer: Offer,
) {
  if (perspective === "creator") {
    return {
      pathname: "/profile/offers/[id]" as const,
      params: { id: String(offer.offerId) },
    };
  }
  return {
    pathname: "/profile/bookings/[id]" as const,
    params: { id: String(offer.offerId) },
  };
}
