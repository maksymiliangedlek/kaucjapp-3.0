import OfferItemsCard from "@/src/components/map/details/offer/offer-items-card";
import { OfferSummaryCard } from "@/src/components/map/details/offer/offer-summary-card";
import PickupCard from "@/src/components/map/details/offer/pickup-card";
import { colors } from "@/src/theme";
import { Offer } from "@/src/types";
import { useRouter } from "expo-router";
import { Package, Receipt } from "lucide-react-native";
import React from "react";

import ContactCard from "../../ui/contact-card";
import ExpandableCard from "../../ui/expandable-card";
import BookingActions from "./booking-actions";
import { BookingBasePath, bookingRoutes } from "./booking-routes";
import BookingStatusSummaryCard from "./booking-status-summary-card";

interface BookingDetailsContentProps {
  offer: Offer;
  basePath: BookingBasePath;
}

export default function BookingDetailsContent({
  offer,
  basePath,
}: BookingDetailsContentProps) {
  const router = useRouter();
  const routes = bookingRoutes(basePath);

  const handleOnUserProfileInfoPress = () => {
    router.push({
      pathname: routes.profileDetails,
      params: { userId: offer.creatorId },
    });
  };

  return (
    <>
      <BookingStatusSummaryCard offer={offer} basePath={basePath} />

      <ContactCard
        userId={offer.creatorId}
        offerId={offer.offerId}
        chatPathname={routes.chat}
        header="Wystawiający"
        onUserProfileInfoPress={handleOnUserProfileInfoPress}
      />

      <PickupCard
        address={offer.pickupAddress}
        instructions={offer.pickupInstructions}
        showMap
        latitude={offer.latitude}
        longitude={offer.longitude}
      />

      <ExpandableCard
        title="Zawartość"
        subtitle={`${offer.totalQuantity} szt. · butelki i puszki`}
        icon={<Package size={18} color={colors.primary.dark} />}
        defaultExpanded={true}
      >
        <OfferItemsCard offer={offer} bare />
      </ExpandableCard>

      <ExpandableCard
        title="Finanse"
        subtitle={`Należność ${offer.totalPrize.toFixed(2).replace(".", ",")} zł`}
        icon={<Receipt size={18} color={colors.primary.dark} />}
        defaultExpanded
      >
        <OfferSummaryCard offer={offer} bare />
      </ExpandableCard>

      <BookingActions
        offerId={offer.offerId}
        offerStatus={offer.status}
        basePath={basePath}
      />
    </>
  );
}
