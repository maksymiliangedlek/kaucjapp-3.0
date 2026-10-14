import { AppRole, User } from "@/src/types/user";

/** Maps camelized /user/me (or /user/:id) payload into the client User model. */
export function mapUserFromApi(userData: Record<string, unknown>): User {
  return {
    userId: userData.userId as number,
    username: userData.username as string,
    firstName: userData.firstName as string,
    lastName: userData.lastName as string,
    phone: (userData.phone as string | null | undefined) ?? null,
    sharePhoneOnReservation:
      (userData.sharePhoneOnReservation as boolean | undefined) ?? true,
    appRole: (userData.appRole as AppRole | null | undefined) ?? null,
    productOnboardingCompleted:
      (userData.productOnboardingCompleted as boolean | undefined) ?? true,
    profilePictureUrl:
      (userData.profilePictureUrl as string | null | undefined) ?? null,
    addresses: (userData.addresses as User["addresses"]) ?? [],
    createdAt: userData.createdAt as string,
    collectedBottleCount: userData.collectedBottleCount as number,
    collectedCanCount: userData.collectedCanCount as number,
    returnedBottleCount: userData.returnedBottleCount as number,
    returnedCanCount: userData.returnedCanCount as number,
    returnedTotalCount: userData.returnedTotalCount as number,
    collectedTotalCount: userData.collectedTotalCount as number,
  };
}

/** Initial route after product onboarding (or when already completed). */
export function getDefaultRouteForAppRole(_appRole?: AppRole | null) {
  return "/(app)/(tabs)/start" as const;
}
