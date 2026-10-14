export type BookingBasePath =
  | "/profile/bookings"
  | "/home"
  | "/start/bookings";

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
    chat: `${basePath}/chat` as `${Exclude<BookingBasePath, "/home">}/chat`,
    complaint:
      `${basePath}/complaint` as `${Exclude<BookingBasePath, "/home">}/complaint`,
    confirmation:
      `${basePath}/confirmation` as `${Exclude<BookingBasePath, "/home">}/confirmation`,
    profileDetails:
      `${basePath}/profile-details-sheet` as `${Exclude<BookingBasePath, "/home">}/profile-details-sheet`,
    dismissTo: basePath,
  };
}
