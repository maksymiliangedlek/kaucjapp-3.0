export type PushPlatform = "ios" | "android";

export type PushNotificationType =
  | "OFFER_RESERVED"
  | "OFFER_CONFIRMED"
  | "OFFER_COMPLETED"
  | "OFFER_MESSAGE"
  | "USER_REVIEW";

// Which side of the offer the recipient is on; decides if we open "my offers" or "my bookings".
export type PushRole = "CREATOR" | "COLLECTOR";

// Payload set by notification-service (all values are strings).
export interface PushData {
  type: PushNotificationType;
  offerId: string;
  role?: PushRole;
}
