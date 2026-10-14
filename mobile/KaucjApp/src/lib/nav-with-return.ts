import type { Href } from "expo-router";

type HrefObject = Extract<Href, object>;

/**
 * Attach `returnTo` so StackHeaderBack can dismiss back to the caller
 * (e.g. Start) instead of the nested Profile stack root.
 */
export function withReturnTo(
  href: HrefObject,
  returnTo: string,
): HrefObject {
  const params =
    href.params && typeof href.params === "object"
      ? { ...href.params, returnTo }
      : { returnTo };
  return { ...href, params };
}
