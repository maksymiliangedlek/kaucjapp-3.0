import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import ConfirmationCheck from "@/src/components/ui/confirmation-check";
import BottleIcon from "@/src/components/offer_creator/bottle-icon";
import CanIcon from "@/src/components/offer_creator/can-icon";
import MiniMap from "@/src/components/profile/reserved-offers/mini-map";
import { PRICE_MAX } from "@/src/validation";
import { colors, rounded, shadows, spacing } from "@/src/theme";

const STEPS = [
  { number: 1, label: "Ilość i cena" },
  { number: 2, label: "Adres" },
  { number: 3, label: "Podgląd" },
] as const;

/** Krakow Old Town — same fallback as other onboarding maps. */
const KRAKOW_CENTER = {
  latitude: 50.0614,
  longitude: 19.9373,
};
const DEMO_ADDRESS = "ul. Floriańska 12, Kraków";
/** Soft layout — high damping so expand/collapse doesn't bounce. */
const layoutSoft = Layout.duration(220);

type ItemKey = "bottles" | "cans";

export default function OnboardingCreateOfferPreview() {
  const [step, setStep] = useState(1);
  const [expanded, setExpanded] = useState<ItemKey | null>("bottles");
  const [bottles, setBottles] = useState(0);
  const [cans, setCans] = useState(0);
  const [bottlePrice, setBottlePrice] = useState(0.2);
  const [canPrice, setCanPrice] = useState(0.2);
  const [addressSet, setAddressSet] = useState(false);
  const [published, setPublished] = useState(false);

  const goToStep = useCallback((next: number) => {
    Haptics.selectionAsync();
    setPublished(false);
    setStep(next);
  }, []);

  const bump = useCallback((kind: ItemKey, delta: number) => {
    Haptics.selectionAsync();
    if (kind === "bottles") {
      setBottles((v) => Math.max(0, v + delta));
    } else {
      setCans((v) => Math.max(0, v + delta));
    }
  }, []);

  const setLocation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddressSet(true);
  }, []);

  const publish = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPublished(true);
  }, []);

  const resetDemo = useCallback(() => {
    Haptics.selectionAsync();
    setPublished(false);
    setStep(1);
    setExpanded("bottles");
    setBottles(0);
    setCans(0);
    setBottlePrice(0.2);
    setCanPrice(0.2);
    setAddressSet(false);
  }, []);

  const canAdvance =
    step === 1
      ? bottles + cans > 0
      : step === 2
        ? addressSet
        : true;

  return (
    <View style={styles.card}>
      <MiniProgress step={step} onStepPress={goToStep} />

      {published ? (
        <Animated.View
          key="success"
          entering={FadeIn.duration(280)}
          exiting={FadeOut.duration(160)}
          style={styles.successBlock}
        >
          <ConfirmationCheck style={{ height: 56, width: 56, marginBottom: 0 }} />
          <Text style={styles.successTitle}>Oferta otwarta!</Text>
          <Pressable onPress={resetDemo} hitSlop={8}>
            <Text style={styles.resetLink}>Spróbuj jeszcze raz</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View
          key={`step-${step}`}
          entering={FadeIn.duration(180)}
          layout={layoutSoft}
          style={styles.stepBody}
        >
          {step === 1 && (
            <View style={styles.rows}>
              <ItemRow
                title="Butelki"
                Icon={BottleIcon}
                quantity={bottles}
                price={bottlePrice}
                isExpanded={expanded === "bottles"}
                onToggle={() =>
                  setExpanded((prev) => (prev === "bottles" ? null : "bottles"))
                }
                onMinus={() => bump("bottles", -1)}
                onPlus={() => bump("bottles", 1)}
                onPriceChange={setBottlePrice}
              />
              <ItemRow
                title="Puszki"
                Icon={CanIcon}
                quantity={cans}
                price={canPrice}
                isExpanded={expanded === "cans"}
                onToggle={() =>
                  setExpanded((prev) => (prev === "cans" ? null : "cans"))
                }
                onMinus={() => bump("cans", -1)}
                onPlus={() => bump("cans", 1)}
                onPriceChange={setCanPrice}
              />
            </View>
          )}

          {step === 2 && (
            <Pressable style={styles.locationCard} onPress={setLocation}>
              <View style={styles.mapWrap}>
                <MiniMap
                  latitude={KRAKOW_CENTER.latitude}
                  longitude={KRAKOW_CENTER.longitude}
                  height={96}
                  interactive={false}
                  pointerEvents="none"
                  style={styles.map}
                />
                {!addressSet && <View style={styles.mapDim} />}
              </View>
              <Text style={styles.locationTitle}>
                {addressSet ? DEMO_ADDRESS : "Wskaż punkt odbioru"}
              </Text>
              <Text style={styles.locationHint}>Wybierz na mapie</Text>
            </Pressable>
          )}

          {step === 3 && (
            <View style={styles.summaryBlock}>
              {bottles > 0 && (
                <SummaryLine
                  label="Butelki"
                  value={`${bottles} szt. · ${bottlePrice.toFixed(2)} zł`}
                />
              )}
              {cans > 0 && (
                <SummaryLine
                  label="Puszki"
                  value={`${cans} szt. · ${canPrice.toFixed(2)} zł`}
                />
              )}
              <SummaryLine
                label="Adres"
                value={addressSet ? DEMO_ADDRESS : "—"}
              />
              <Pressable
                style={[
                  styles.publishBtn,
                  !(bottles + cans > 0 && addressSet) &&
                    styles.publishBtnDisabled,
                ]}
                disabled={!(bottles + cans > 0 && addressSet)}
                onPress={publish}
              >
                <Text style={styles.publishBtnText}>Opublikuj ofertę</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      )}

      {!published && (
        <View style={styles.navRow}>
          <Pressable
            style={[styles.navBtn, step === 1 && styles.navBtnGhost]}
            disabled={step === 1}
            onPress={() => goToStep(step - 1)}
          >
            <Text
              style={[styles.navBtnText, step === 1 && styles.navBtnTextMuted]}
            >
              Wstecz
            </Text>
          </Pressable>
          {step < 3 ? (
            <Pressable
              style={[
                styles.navBtnPrimary,
                !canAdvance && styles.publishBtnDisabled,
              ]}
              disabled={!canAdvance}
              onPress={() => goToStep(step + 1)}
            >
              <Text style={styles.navBtnPrimaryText}>Dalej</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

function MiniProgress({
  step,
  onStepPress,
}: {
  step: number;
  onStepPress: (n: number) => void;
}) {
  return (
    <View style={styles.progressRow}>
      {STEPS.map((s, index) => {
        const isDone = s.number < step;
        const isActive = s.number === step;
        const isLast = index === STEPS.length - 1;
        return (
          <React.Fragment key={s.number}>
            <Pressable
              style={styles.stepNode}
              onPress={() => onStepPress(s.number)}
            >
              <View
                style={[
                  styles.stepDot,
                  isActive && styles.stepDotActive,
                  isDone && styles.stepDotDone,
                ]}
              >
                <Text
                  style={[
                    styles.stepDotText,
                    (isActive || isDone) && styles.stepDotTextOn,
                  ]}
                >
                  {isDone ? "✓" : s.number}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isDone && styles.stepLabelDone,
                ]}
                numberOfLines={1}
              >
                {s.label}
              </Text>
            </Pressable>
            {!isLast && (
              <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function ItemRow({
  title,
  Icon,
  quantity,
  price,
  isExpanded,
  onToggle,
  onMinus,
  onPlus,
  onPriceChange,
}: {
  title: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  quantity: number;
  price: number;
  isExpanded: boolean;
  onToggle: () => void;
  onMinus: () => void;
  onPlus: () => void;
  onPriceChange: (v: number) => void;
}) {
  return (
    <Animated.View layout={layoutSoft} style={styles.qtyRow}>
      <Pressable style={styles.qtyHeader} onPress={onToggle}>
        <View style={styles.qtyLeft}>
          <View style={styles.qtyIcon}>
            <Icon size={18} color={colors.primary.dark} />
          </View>
          <View>
            <Text style={styles.qtyTitle}>{title}</Text>
            {quantity > 0 && !isExpanded && (
              <Text style={styles.qtySummary}>
                {quantity} szt. · {price.toFixed(2)} zł/szt.
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.chevron}>{isExpanded ? "−" : "+"}</Text>
      </Pressable>

      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(140)}
          exiting={FadeOut.duration(100)}
          style={styles.expanded}
        >
          <View style={styles.stepper}>
            <Text style={styles.fieldLabel}>Ilość</Text>
            <View style={styles.stepperControls}>
              <Pressable style={styles.stepperBtn} onPress={onMinus}>
                <Text style={styles.stepperBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable style={styles.stepperBtn} onPress={onPlus}>
                <Text style={styles.stepperBtnText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.priceBlock}>
            <View style={styles.priceHeader}>
              <Text style={styles.fieldLabel}>Cena za sztukę</Text>
              <Text style={styles.priceValue}>
                {price <= 0 ? "Za darmo" : `${price.toFixed(2)} zł`}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={PRICE_MAX}
              step={0.01}
              value={price}
              onValueChange={(v) => {
                onPriceChange(Math.round(v * 100) / 100);
              }}
              minimumTrackTintColor={colors.primary.base}
              maximumTrackTintColor={colors.status.border}
              thumbTintColor={colors.primary.dark}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Za darmo</Text>
              <Text style={styles.sliderLabel}>{PRICE_MAX.toFixed(2)} zł</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryLine}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  stepNode: {
    alignItems: "center",
    gap: 4,
    maxWidth: 72,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background.subtle,
    borderWidth: 1.5,
    borderColor: colors.status.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: colors.primary.base,
    borderColor: colors.primary.base,
  },
  stepDotDone: {
    backgroundColor: colors.primary.dark,
    borderColor: colors.primary.dark,
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.muted,
  },
  stepDotTextOn: {
    color: colors.text.white,
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  stepLabelActive: {
    color: colors.primary.base,
  },
  stepLabelDone: {
    color: colors.primary.dark,
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.status.border,
    marginHorizontal: 4,
    marginTop: 12,
  },
  stepLineDone: {
    backgroundColor: colors.primary.dark,
  },
  stepBody: {
    minHeight: 118,
    justifyContent: "center",
  },
  rows: {
    gap: spacing.xs,
  },
  qtyRow: {
    backgroundColor: colors.background.main,
    borderRadius: rounded.lg,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    overflow: "hidden",
  },
  qtyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    flex: 1,
  },
  qtyIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  qtySummary: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  chevron: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary.dark,
    paddingHorizontal: 4,
  },
  expanded: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.status.border,
    gap: spacing.xs,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.status.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary.dark,
    lineHeight: 20,
  },
  qtyValue: {
    minWidth: 22,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  priceBlock: {
    gap: 2,
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary.base,
  },
  slider: {
    width: "100%",
    height: 28,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabel: {
    fontSize: 10,
    color: colors.text.muted,
  },
  locationCard: {
    alignItems: "center",
    gap: 6,
  },
  mapWrap: {
    width: "100%",
    borderRadius: rounded.lg,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    borderRadius: rounded.lg,
  },
  mapDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(246, 247, 244, 0.28)",
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },
  locationHint: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  summaryBlock: {
    gap: spacing.xs,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  summaryValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
  },
  publishBtn: {
    marginTop: spacing.xs,
    backgroundColor: colors.primary.base,
    borderRadius: rounded.lg,
    paddingVertical: 10,
    alignItems: "center",
    ...shadows.light,
  },
  publishBtnDisabled: {
    opacity: 0.4,
  },
  publishBtnText: {
    color: colors.text.white,
    fontWeight: "700",
    fontSize: 14,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navBtnGhost: {
    opacity: 0.35,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  navBtnTextMuted: {
    color: colors.text.muted,
  },
  navBtnPrimary: {
    backgroundColor: colors.primary.base,
    borderRadius: rounded.lg,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navBtnPrimaryText: {
    color: colors.text.white,
    fontWeight: "700",
    fontSize: 14,
  },
  successBlock: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 118,
    gap: spacing.xs,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary.dark,
  },
  resetLink: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary.base,
    marginTop: 2,
  },
});
