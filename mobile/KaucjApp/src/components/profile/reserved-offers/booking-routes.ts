export type BookingBasePath = "/profile/bookings" | "/home";

export function bookingRoutes(basePath: BookingBasePath) {
  if (basePath === "/home") {
    return {
      chat: "/home/chat" as const,
      complaint: "/home/complaint" as const,
      confirmation: "/home/confirmation" as const,
      profileDetails: "/home/profile-details-sheet" as const,
      dismissTo: "/home" as const,
    };
  }

  return {
    chat: "/profile/bookings/chat" as const,
    complaint: "/profile/bookings/complaint" as const,
    confirmation: "/profile/bookings/confirmation" as const,
    profileDetails: "/profile/bookings/profile-details-sheet" as const,
    dismissTo: "/profile/bookings" as const,
  };
}
