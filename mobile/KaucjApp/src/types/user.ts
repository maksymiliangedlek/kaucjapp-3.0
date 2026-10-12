/** Contextual role when viewing another user (offer creator vs collector) — not app preference. */
export type UserRole = "collector" | "creator";

/** Preferred usage role for home routing and product onboarding. */
export type AppRole = "OFFERER" | "COLLECTOR" | "BOTH";

export interface User {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  sharePhoneOnReservation: boolean;
  appRole: AppRole | null;
  productOnboardingCompleted: boolean;
  profilePictureUrl?: string | null;
  createdAt: string;
  collectedBottleCount: number;
  collectedCanCount: number;
  returnedBottleCount: number;
  returnedCanCount: number;
  returnedTotalCount: number;
  collectedTotalCount: number;
  addresses: UserAddress[];
}

export interface UserAddress {
  addressLabel?: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}
