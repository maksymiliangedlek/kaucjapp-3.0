import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { MapPin, MessageCircle, Package, Check } from "lucide-react-native";
import OfferSatusPill from "@/src/components/ui/offer-status-pill";
import { colors, rounded, shadows, spacing } from "@/src/theme";
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
          <OnboardingSwipeSlider />
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
          <OnboardingStatsPreview />
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

function OnboardingSwipeSlider() {
  const [trackWidth, setTrackWidth] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const translateX = useSharedValue(0);

  const THUMB_SIZE = 44;
  const TRACK_PADDING = 4;
  const maxTravel = Math.max(0, trackWidth - THUMB_SIZE - TRACK_PADDING * 2);
  const threshold = 0.85;

  const triggerReset = () => {
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    setIsCompleted(false);
  };

  const panGesture = Gesture.Pan()
    .enabled(!isCompleted && maxTravel > 0)
    .activeOffsetX([-6, 6])
    .failOffsetY([-8, 8])
    .onUpdate((e) => {
      translateX.value = Math.max(0, Math.min(e.translationX, maxTravel));
    })
    .onEnd(() => {
      if (maxTravel > 0 && translateX.value / maxTravel >= threshold) {
        translateX.value = withTiming(maxTravel, { duration: 120 });
        runOnJS(setIsCompleted)(true);
        runOnJS(Haptics.notificationAsync)(
          Haptics.NotificationFeedbackType.Success
        );
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        setIsCompleted(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, translateX]);

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor: isCompleted ? colors.status.success : colors.primary.base,
  }));

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: translateX.value + THUMB_SIZE + TRACK_PADDING,
    backgroundColor: isCompleted ? colors.status.success : colors.primary.base,
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: maxTravel > 0
      ? interpolate(translateX.value, [0, maxTravel * 0.5], [1, 0], Extrapolation.CLAMP)
      : 1,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.interactiveSliderTrack} onLayout={onLayout}>
      <Animated.View
        style={[styles.interactiveSliderFill, fillAnimatedStyle]}
      />
      <Animated.Text
        style={[styles.interactiveSliderLabel, labelAnimatedStyle]}
      >
        Przesuń, aby zarezerwować
      </Animated.Text>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.interactiveSliderThumb, thumbAnimatedStyle]}
        >
          {isCompleted ? (
            <Check size={20} color={colors.text.white} />
          ) : (
            <Text style={styles.interactiveSliderThumbText}>›</Text>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function OnboardingStatsPreview() {
  const [activeTab, setActiveTab] = useState<"collector" | "offerer">("collector");

  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Twoje statystyki</Text>

      {/* Miniaturka Segmented Control */}
      <View style={styles.miniSegmentedControl}>
        <Pressable
          style={[
            styles.miniSegmentButton,
            activeTab === "collector" && styles.miniSegmentButtonActive,
          ]}
          onPress={() => setActiveTab("collector")}
        >
          <Text
            style={[
              styles.miniSegmentText,
              activeTab === "collector" && styles.miniSegmentTextActive,
            ]}
          >
            Kurier
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.miniSegmentButton,
            activeTab === "offerer" && styles.miniSegmentButtonActive,
          ]}
          onPress={() => setActiveTab("offerer")}
        >
          <Text
            style={[
              styles.miniSegmentText,
              activeTab === "offerer" && styles.miniSegmentTextActive,
            ]}
          >
            Oddający
          </Text>
        </Pressable>
      </View>

      {/* 3 Stat-Items */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {activeTab === "collector" ? "24" : "16"}
          </Text>
          <Text style={styles.statLabel}>Butelki</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {activeTab === "collector" ? "12" : "8"}
          </Text>
          <Text style={styles.statLabel}>Puszki</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {activeTab === "collector" ? "18,00 zł" : "12,00 zł"}
          </Text>
          <Text style={styles.statLabel}>Wartość</Text>
        </View>
      </View>
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
  interactiveSliderTrack: {
    height: 52,
    borderRadius: rounded.pill,
    backgroundColor: colors.primary.light,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  interactiveSliderFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: rounded.pill,
    opacity: 0.35,
  },
  interactiveSliderLabel: {
    position: "absolute",
    alignSelf: "center",
    textAlign: "center",
    color: colors.primary.dark,
    fontWeight: "600",
    fontSize: 13,
  },
  interactiveSliderThumb: {
    position: "absolute",
    left: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.base,
    alignItems: "center",
    justifyContent: "center",
  },
  interactiveSliderThumbText: {
    color: colors.text.white,
    fontSize: 22,
    fontWeight: "700",
  },
  statsContainer: {
    gap: spacing.sm,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  miniSegmentedControl: {
    flexDirection: "row",
    backgroundColor: colors.background.main,
    borderRadius: rounded.lg,
    padding: 3,
    width: "100%",
  },
  miniSegmentButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rounded.md,
  },
  miniSegmentButtonActive: {
    backgroundColor: colors.background.card,
    ...shadows.light,
  },
  miniSegmentText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  miniSegmentTextActive: {
    color: colors.text.primary,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background.main,
    borderRadius: rounded.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: "center",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary.base,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
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
