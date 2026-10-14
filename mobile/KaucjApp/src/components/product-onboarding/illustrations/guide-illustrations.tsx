import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { MapPin, MessageCircle, Package, Check } from "lucide-react-native";
import ConfirmationCheck from "@/src/components/ui/confirmation-check";
import OfferSatusPill from "@/src/components/ui/offer-status-pill";
import OnboardingMapPreview, {
  DEMO_RESERVED_OFFER_ID,
} from "./onboarding-map-preview";
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
      return <OnboardingMapPreview />;
    case "swipeReserve":
      return (
        <View style={styles.card}>
          <OnboardingSwipeSlider />
        </View>
      );
    case "collectorChat":
      // Same map as B1, with one offer styled as the user's reservation.
      return <OnboardingMapPreview reservedOfferId={DEMO_RESERVED_OFFER_ID} />;
    case "mapMachines":
      return <OnboardingMapPreview variant="machines" />;
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

const SLIDER_THUMB_SIZE = 64;
const SLIDER_COMPLETION_THRESHOLD = 0.85;

function OnboardingSwipeSlider() {
  const [trackWidth, setTrackWidth] = useState(0);
  const [sliderState, setSliderState] = useState<"idle" | "loading" | "success">("idle");
  const isLocked = React.useRef(false);

  const translateX = useSharedValue(0);
  const fillWidth = useSharedValue(SLIDER_THUMB_SIZE);
  const labelOpacity = useSharedValue(1);
  const arrowPulse = useSharedValue(0);

  const maxTranslate = Math.max(0, trackWidth - SLIDER_THUMB_SIZE);

  useEffect(() => {
    arrowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [arrowPulse]);


  const handleComplete = React.useCallback(() => {
    isLocked.current = true;
    translateX.value = withTiming(maxTranslate, { duration: 120 });
    fillWidth.value = withTiming(trackWidth, { duration: 120 });
    labelOpacity.value = withTiming(0, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setSliderState("success");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [fillWidth, maxTranslate, trackWidth, translateX]);

  const panGesture = Gesture.Pan()
    .enabled(sliderState === "idle" && maxTranslate > 0)
    .activeOffsetX([-6, 6])
    .failOffsetY([-8, 8])
    .onUpdate((e) => {
      if (isLocked.current) return;
      const next = Math.max(0, Math.min(e.translationX, maxTranslate));
      translateX.value = next;
      fillWidth.value = SLIDER_THUMB_SIZE + next;
      labelOpacity.value = Math.max(0, 1 - next / (maxTranslate * 0.6));
    })
    .onEnd(() => {
      if (isLocked.current) return;
      if (maxTranslate > 0 && translateX.value >= maxTranslate * SLIDER_COMPLETION_THRESHOLD) {
        runOnJS(handleComplete)();
      } else {
        runOnJS(Haptics.selectionAsync)();
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        fillWidth.value = withTiming(SLIDER_THUMB_SIZE, { duration: 300 });
        labelOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor: sliderState === "success" ? colors.status.success : colors.primary.base,
  }));

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: fillWidth.value,
    backgroundColor: sliderState === "success" ? colors.status.success : colors.primary.base,
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(arrowPulse.value, [0, 1], [0.5, 1]),
    transform: [{ translateX: interpolate(arrowPulse.value, [0, 1], [0, 4]) }],
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.sliderHost}>
      {sliderState === "success" ? (
        <View style={styles.successOverlay}>
          <ConfirmationCheck style={{ height: 64, width: 64, marginBottom: 0 }} />
          <Text style={styles.successTitle}>Zarezerwowano!</Text>
        </View>
      ) : (
        <View style={styles.realSliderWrapper} onLayout={onLayout}>
          <Animated.View style={[styles.realSliderFill, fillAnimatedStyle]} />

          <Animated.Text style={[styles.realSliderLabel, labelAnimatedStyle]}>
            Przesuń, aby zarezerwować
          </Animated.Text>

          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.realSliderThumb, thumbAnimatedStyle]}>
              <Animated.Text style={[styles.realSliderArrow, arrowAnimatedStyle]}>
                »
              </Animated.Text>
            </Animated.View>
          </GestureDetector>
        </View>
      )}
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
  sliderHost: {
    minHeight: 120,
    justifyContent: "center",
  },
  successOverlay: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary.dark,
    marginTop: -spacing.sm,
  },
  realSliderWrapper: {
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background.subtle,
    justifyContent: "center",
    overflow: "hidden",
    marginVertical: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.base,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  realSliderFill: {
    ...StyleSheet.absoluteFillObject,
    right: undefined,
    borderRadius: 32,
    opacity: 0.6,
  },
  realSliderLabel: {
    position: "absolute",
    alignSelf: "center",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: colors.text.primary,
    marginLeft: 32,
  },
  realSliderThumb: {
    position: "absolute",
    left: 0,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  realSliderArrow: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
    marginLeft: 2,
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
