export type OfferBasePath = "/profile/offers" | "/start/offers";

export function offerRoutes(basePath: OfferBasePath) {
  return {
    chat: `${basePath}/chat` as `${OfferBasePath}/chat`,
    complaint: `${basePath}/complaint` as `${OfferBasePath}/complaint`,
    confirmation: `${basePath}/confirmation` as `${OfferBasePath}/confirmation`,
    profileDetails:
      `${basePath}/profile-details-sheet` as `${OfferBasePath}/profile-details-sheet`,
    dismissTo: basePath,
  };
}
