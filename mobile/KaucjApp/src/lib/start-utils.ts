import { Offer } from "@/src/types";
import { getTimeParts, MINUTE, parseDateToMs } from "./countdown";

export function formatOfferItemsLabel(offer: Offer): string {
  const parts: string[] = [];
  if (offer.plasticQuantity > 0) {
    parts.push(`Butelki · ${offer.plasticQuantity} szt.`);
  }
  if (offer.canQuantity > 0) {
    parts.push(`Puszki · ${offer.canQuantity} szt.`);
  }
  return parts.join(" · ") || `${offer.totalQuantity} szt.`;
}

/** Expiry timestamp used for attention urgency / countdown. */
export function getAttentionExpiresAt(offer: Offer): string | null {
  if (offer.status === "RESERVED") return offer.reservedTo;
  if (offer.status === "PENDING_CONFIRMATION") return offer.confirmationDeadline;
  return null;
}

export function getAttentionUrgencyMs(
  offer: Offer,
  nowMs = Date.now(),
): number {
  const expiresAt = getAttentionExpiresAt(offer);
  if (!expiresAt) return Number.POSITIVE_INFINITY;
  return Math.max(0, parseDateToMs(expiresAt) - nowMs);
}

export function sortByAttentionUrgency(a: Offer, b: Offer): number {
  return getAttentionUrgencyMs(a) - getAttentionUrgencyMs(b);
}

export function isAttentionOffer(offer: Offer): boolean {
  return (
    offer.status === "RESERVED" || offer.status === "PENDING_CONFIRMATION"
  );
}

/** Warm amber under 15 min — avoid aggressive red on Start. */
export function isAttentionUrgent(
  offer: Offer,
  nowMs = Date.now(),
): boolean {
  const ms = getAttentionUrgencyMs(offer, nowMs);
  return ms > 0 && ms < 15 * MINUTE;
}

export function formatRemainingLabel(
  expiresAt: string,
  nowMs = Date.now(),
): string {
  const { totalMs, days, hours, minutes } = getTimeParts(
    parseDateToMs(expiresAt),
    nowMs,
  );
  if (totalMs <= 0) return "Czas minął";
  if (days > 0) return `Zostało ${days} d ${hours} h`;
  if (hours > 0) return `Zostało ${hours} h ${minutes} min`;
  return `Zostało ${minutes} min`;
}

const EARTH_RADIUS_M = 6371000;

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** ~3 km box around a point for nearby search. */
export function bboxAround(
  latitude: number,
  longitude: number,
  delta = 0.03,
) {
  return {
    swLat: latitude - delta,
    swLon: longitude - delta,
    neLat: latitude + delta,
    neLon: longitude + delta,
  };
}

export function daysIntoMonth(now = new Date()): number {
  return Math.max(1, now.getUTCDate());
}
