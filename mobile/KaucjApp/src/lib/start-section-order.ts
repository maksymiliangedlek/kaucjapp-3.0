import { AppRole } from "@/src/types/user";

export type StartContentSection = "nearby" | "activeOffers";

/** Role sets priority order only — both sections remain available. */
export function startContentSectionOrder(
  appRole: AppRole | null | undefined,
): StartContentSection[] {
  if (appRole === "OFFERER") {
    return ["activeOffers", "nearby"];
  }
  // COLLECTOR, BOTH, null — nearby first (BOTH: equal weight, neutral default)
  return ["nearby", "activeOffers"];
}
