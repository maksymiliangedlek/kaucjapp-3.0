import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MapPin, MessageCircle, Package, Check } from "lucide-react-native";
import OfferSatusPill from "@/src/components/ui/offer-status-pill";
import { colors, rounded, spacing } from "@/src/theme";
import { GuideIllustrationId } from "@/src/constants/product-onboarding/steps";
import { OfferStatus } from "@/src/types";

interface IllustrationProps {
  id: GuideIllustrationId;
  statusBadge?: OfferStatus;
}

export default function GuideIllustration({
  id,
  statusBadge,
}: IllustrationProps) {
  return (
    <View style={styles.frame}>
      {statusBadge ? (
        <View style={styles.badgeSlot}>
          <OfferSatusPill status={statusBadge} />
        </View>
      ) : null}
      {renderArt(id)}
    </View>
  );
}

function renderArt(id: GuideIllustrationId) {
  switch (id) {
    case "createOffer":
      return (
        <View style={styles.card}>
          <StepRow label="Ilość" active />
          <StepRow label="Lokalizacja" />
          <StepRow label="Publikuj" />
          <Text style={styles.cardHint}>3 kroki do otwartej oferty</Text>
        </View>
      );
    case "reservedChat":
      return (
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>KN</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>Kacper Nowak</Text>
              <Text style={styles.profileMeta}>Kurier · 1,2 km</Text>
            </View>
          </View>
          <View style={styles.chatBubble}>
            <MessageCircle size={14} color={colors.primary.base} />
            <Text style={styles.chatText}>Mogę wpaść koło 18?</Text>
          </View>
        </View>
      );
    case "meetup":
      return (
        <View style={styles.card}>
          <View style={styles.mapStub}>
            <MapPin size={28} color={colors.primary.base} />
            <Text style={styles.mapLabel}>Punkt odbioru</Text>
          </View>
          <View style={[styles.chatBubble, styles.chatBubbleOut]}>
            <Text style={styles.chatText}>Jestem już na miejscu!</Text>
          </View>
        </View>
      );
    case "confirm":
      return (
        <View style={[styles.card, styles.confirmCard]}>
          <View style={styles.checkPair}>
            <View style={styles.checkCircle}>
              <Check size={20} color={colors.text.white} />
            </View>
            <View style={styles.checkLine} />
            <View style={styles.checkCircle}>
              <Check size={20} color={colors.text.white} />
            </View>
          </View>
          <Text style={styles.cardHint}>Obie strony potwierdziły odbiór</Text>
        </View>
      );
    case "mapOffers":
      return (
        <View style={styles.card}>
          <View style={styles.mapStub}>
            <View style={styles.pin} />
            <View style={[styles.pin, styles.pinAlt]} />
            <View style={[styles.pin, styles.pinFar]} />
          </View>
          <View style={styles.offerPreview}>
            <Package size={16} color={colors.primary.base} />
            <Text style={styles.offerPreviewText}>20 butelek · Słoneczna 12</Text>
          </View>
        </View>
      );
    case "swipeReserve":
      return (
        <View style={styles.card}>
          <View style={styles.sliderTrack}>
            <View style={styles.sliderThumb}>
              <Text style={styles.sliderThumbText}>›</Text>
            </View>
            <Text style={styles.sliderLabel}>Przesuń, aby zarezerwować</Text>
          </View>
        </View>
      );
    case "collectorChat":
      return (
        <View style={styles.card}>
          <View style={styles.mapStubCompact}>
            <MapPin size={22} color={colors.primary.base} />
          </View>
          <View style={styles.chatBubble}>
            <Text style={styles.chatText}>Podjadę za 10 minut</Text>
          </View>
        </View>
      );
    case "stats":
      return (
        <View style={styles.card}>
          <Text style={styles.statsTitle}>Twoje statystyki</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Wymiany</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>48</Text>
              <Text style={styles.statLabel}>kg CO₂</Text>
            </View>
          </View>
        </View>
      );
    case "transition":
      return (
        <View style={[styles.card, styles.transitionCard]}>
          <Package size={36} color={colors.primary.base} />
          <Text style={styles.transitionArrow}>→</Text>
          <Text style={styles.transitionTruck}>🚚</Text>
        </View>
      );
  }
}

function StepRow({ label, active }: { label: string; active?: boolean }) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, active && styles.stepDotActive]} />
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    minHeight: 200,
    justifyContent: "center",
  },
  badgeSlot: {
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  cardHint: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.status.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary.base,
  },
  stepLabel: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  stepLabelActive: {
    color: colors.text.primary,
    fontWeight: "700",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "700",
    color: colors.primary.dark,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  profileMeta: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  chatBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: rounded.lg,
  },
  chatBubbleOut: {
    alignSelf: "flex-end",
    backgroundColor: colors.accent.light,
  },
  chatText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  mapStub: {
    height: 110,
    borderRadius: rounded.lg,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  mapStubCompact: {
    height: 72,
    borderRadius: rounded.lg,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  mapLabel: {
    fontSize: 13,
    color: colors.primary.dark,
    fontWeight: "600",
  },
  confirmCard: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  checkPair: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.base,
    alignItems: "center",
    justifyContent: "center",
  },
  checkLine: {
    width: 48,
    height: 3,
    backgroundColor: colors.primary.base,
  },
  pin: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary.base,
    top: 36,
    left: "42%",
  },
  pinAlt: {
    top: 58,
    left: "58%",
    backgroundColor: colors.accent.base,
  },
  pinFar: {
    top: 28,
    left: "28%",
    width: 10,
    height: 10,
  },
  offerPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  offerPreviewText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  sliderTrack: {
    height: 52,
    borderRadius: rounded.pill,
    backgroundColor: colors.primary.light,
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  sliderThumb: {
    position: "absolute",
    left: 6,
    width: 44,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.base,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderThumbText: {
    color: colors.text.white,
    fontSize: 22,
    fontWeight: "700",
  },
  sliderLabel: {
    textAlign: "center",
    color: colors.primary.dark,
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 40,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background.main,
    borderRadius: rounded.lg,
    padding: spacing.sm,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary.base,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  transitionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  transitionArrow: {
    fontSize: 28,
    color: colors.text.secondary,
  },
  transitionTruck: {
    fontSize: 36,
  },
});
