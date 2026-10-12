import { OfferStatus } from "@/src/types";
import { AppRole } from "@/src/types/user";
import { GuideStepId, productOnboardingCopy } from "./copy";

export type GuidePermission = "location" | "notifications";

export type GuideStepConfig = {
  id: GuideStepId;
  title: string;
  body: string;
  statusBadge?: OfferStatus;
  permission?: GuidePermission;
  isFinal?: boolean;
  /** For BOTH flow progress sections (1 = offerer, 2 = collector). */
  section?: 1 | 2;
  illustration: GuideIllustrationId;
};

export type GuideIllustrationId =
  | "createOffer"
  | "reservedChat"
  | "meetup"
  | "confirm"
  | "mapOffers"
  | "swipeReserve"
  | "collectorChat"
  | "stats"
  | "transition";

const A_STEPS: GuideStepConfig[] = [
  {
    id: "A1",
    title: productOnboardingCopy.steps.A1.title,
    body: productOnboardingCopy.steps.A1.body,
    statusBadge: "OPEN",
    illustration: "createOffer",
    section: 1,
  },
  {
    id: "A2",
    title: productOnboardingCopy.steps.A2.title,
    body: productOnboardingCopy.steps.A2.body,
    statusBadge: "RESERVED",
    permission: "notifications",
    illustration: "reservedChat",
    section: 1,
  },
  {
    id: "A3",
    title: productOnboardingCopy.steps.A3.title,
    body: productOnboardingCopy.steps.A3.body,
    illustration: "meetup",
    section: 1,
  },
  {
    id: "A4",
    title: productOnboardingCopy.steps.A4.title,
    body: productOnboardingCopy.steps.A4.body,
    statusBadge: "COMPLETED",
    isFinal: true,
    illustration: "confirm",
    section: 1,
  },
];

const B_STEPS: GuideStepConfig[] = [
  {
    id: "B1",
    title: productOnboardingCopy.steps.B1.title,
    body: productOnboardingCopy.steps.B1.body,
    permission: "location",
    illustration: "mapOffers",
    section: 2,
  },
  {
    id: "B2",
    title: productOnboardingCopy.steps.B2.title,
    body: productOnboardingCopy.steps.B2.body,
    statusBadge: "RESERVED",
    illustration: "swipeReserve",
    section: 2,
  },
  {
    id: "B3",
    title: productOnboardingCopy.steps.B3.title,
    body: productOnboardingCopy.steps.B3.body,
    illustration: "collectorChat",
    section: 2,
  },
  {
    id: "B4",
    title: productOnboardingCopy.steps.B4.title,
    body: productOnboardingCopy.steps.B4.body,
    statusBadge: "COMPLETED",
    isFinal: true,
    illustration: "stats",
    section: 2,
  },
];

const TRANSITION_STEP: GuideStepConfig = {
  id: "transition",
  title: productOnboardingCopy.transition.title,
  body: productOnboardingCopy.transition.body,
  illustration: "transition",
  section: 2,
};

export function buildGuideSteps(role: AppRole): GuideStepConfig[] {
  switch (role) {
    case "OFFERER":
      return A_STEPS.map((s) => ({ ...s, section: undefined, isFinal: s.id === "A4" }));
    case "COLLECTOR":
      return B_STEPS.map((s) => ({ ...s, section: undefined, isFinal: s.id === "B4" }));
    case "BOTH": {
      const a = A_STEPS.map((s) => ({
        ...s,
        isFinal: false,
        section: 1 as const,
      }));
      const b = B_STEPS.map((s) => ({
        ...s,
        section: 2 as const,
        isFinal: s.id === "B4",
      }));
      return [...a, TRANSITION_STEP, ...b];
    }
  }
}

export function progressMeta(role: AppRole, stepIndex: number, steps: GuideStepConfig[]) {
  const total = steps.length;
  const current = stepIndex + 1;
  if (role !== "BOTH") {
    return {
      mode: "single" as const,
      current,
      total,
      filledRatio: current / total,
    };
  }

  const part1Count = steps.filter((s) => s.section === 1).length;
  const inPart1 = steps[stepIndex]?.section === 1;
  const part1Filled = inPart1
    ? stepIndex + 1
    : part1Count;
  const part2Index = inPart1 ? 0 : stepIndex - part1Count;
  const part2Count = steps.filter((s) => s.section === 2).length;
  const part2Filled = inPart1 ? 0 : part2Index + 1;

  return {
    mode: "split" as const,
    current,
    total,
    part1: { filled: part1Filled, total: part1Count },
    part2: { filled: part2Filled, total: part2Count },
  };
}
