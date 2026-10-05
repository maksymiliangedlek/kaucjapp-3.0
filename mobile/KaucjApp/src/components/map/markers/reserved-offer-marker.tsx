import { Offer } from "@/src/types";
import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Marker } from "react-native-maps";
import { colors } from "@/src/theme";
import { formatPrice } from "@/src/lib";
import { useMarkerTracking } from "./use-marker-tracking";

interface ReservedOfferMarkerProps {
  offer: Offer;
  onPress: (offer: Offer) => void;
}

export const ReservedOfferMarker = React.memo(
  ({ offer, onPress }: ReservedOfferMarkerProps) => {
    const { tracksViewChanges, onRendered } = useMarkerTracking(
      `${offer.status}-${offer.totalQuantity}-${offer.totalIncome}`,
    );

    return (
      <Marker
        identifier={`reserved-${offer.offerId}`}
        coordinate={{ latitude: offer.latitude, longitude: offer.longitude }}
        onPress={() => onPress(offer)}
        tracksViewChanges={tracksViewChanges}
        anchor={{ x: 0.5, y: 1 }}
        centerOffset={{ x: 0, y: -20 }}
        zIndex={20}
      >
        <View style={styles.markerContainer} onLayout={onRendered}>
          <View style={styles.bubble}>
            <Text style={styles.label} numberOfLines={1}>
              Twoja rezerwacja
            </Text>
            <Text style={styles.bubbleText} numberOfLines={1}>
              {offer.totalQuantity} sztuk +{formatPrice(offer.totalIncome)}
            </Text>
          </View>
          <View style={styles.triangle} />
          <View style={styles.markerCore} />
        </View>
      </Marker>
    );
  },
  (prevProps, nextProps) =>
    prevProps.offer.updatedAt === nextProps.offer.updatedAt &&
    prevProps.offer.offerId === nextProps.offer.offerId &&
    prevProps.offer.status === nextProps.offer.status &&
    prevProps.offer.totalQuantity === nextProps.offer.totalQuantity &&
    prevProps.offer.totalPrize === nextProps.offer.totalPrize,
);

ReservedOfferMarker.displayName = "ReservedOfferMarker";

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    backgroundColor: colors.primary.base,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.white,
    letterSpacing: -0.1,
  },
  bubbleText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.white,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: colors.primary.base,
    transform: [{ rotate: "180deg" }],
    marginBottom: 2,
  },
  markerCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.text.white,
    borderWidth: 2,
    borderColor: colors.primary.base,
  },
});
