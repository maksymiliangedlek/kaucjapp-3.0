import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";
import * as Location from "expo-location";
import { colors, rounded } from "@/src/theme";
import { formatPrice } from "@/src/lib";
import type { DepositMachineStatus } from "@/src/types";

/** Krakow Old Town — matches the look of the in-app map when location is unavailable. */
const FALLBACK_CENTER = {
  latitude: 50.0614,
  longitude: 19.9373,
};

type DemoOffer = {
  id: string;
  latitude: number;
  longitude: number;
  totalQuantity: number;
  totalIncome: number;
};

type DemoMachine = {
  id: string;
  latitude: number;
  longitude: number;
  status: DepositMachineStatus;
};

const MACHINE_MARKER_IMAGES: Record<DepositMachineStatus, ImageSourcePropType> =
  {
    AVAILABLE: require("@/assets/images/markers/deposit_marker_green.png"),
    FULL: require("@/assets/images/markers/deposit_marker_yellow.png"),
    OUT_OF_ORDER: require("@/assets/images/markers/deposit_marker_red.png"),
  };

/** Same id highlighted as reserved on B3 — B5 centers the "you are here" pin here. */
export const DEMO_RESERVED_OFFER_ID = "demo-3";

function buildDemoOffers(center: { latitude: number; longitude: number }): DemoOffer[] {
  const { latitude: lat, longitude: lon } = center;
  return [
    {
      // was top-left → shifted down-left
      id: "demo-1",
      latitude: lat + 0.0015,
      longitude: lon - 0.0158,
      totalQuantity: 10,
      totalIncome: 3,
    },
    {
      // bottom-left → further left
      id: "demo-2",
      latitude: lat - 0.0063,
      longitude: lon - 0.0095,
      totalQuantity: 16,
      totalIncome: 4,
    },
    {
      // bottom-right → further right (reserved on B3)
      id: DEMO_RESERVED_OFFER_ID,
      latitude: lat - 0.002,
      longitude: lon + 0.0115,
      totalQuantity: 20,
      totalIncome: 4.3,
    },
    {
      id: "demo-4",
      latitude: lat + 0.0032,
      longitude: lon + 0.0045,
      totalQuantity: 12,
      totalIncome: 3.5,
    },
  ];
}

function getReservedOfferPosition(userCenter: {
  latitude: number;
  longitude: number;
}) {
  const reserved = buildDemoOffers(userCenter).find(
    (o) => o.id === DEMO_RESERVED_OFFER_ID,
  );
  return {
    latitude: reserved!.latitude,
    longitude: reserved!.longitude,
  };
}

function buildDemoMachines(center: {
  latitude: number;
  longitude: number;
}): DemoMachine[] {
  const { latitude: lat, longitude: lon } = center;
  return [
    {
      id: "machine-1",
      latitude: lat + 0.0055,
      longitude: lon - 0.007,
      status: "AVAILABLE",
    },
    {
      id: "machine-2",
      latitude: lat - 0.006,
      longitude: lon - 0.0045,
      status: "AVAILABLE",
    },
    {
      id: "machine-3",
      latitude: lat + 0.002,
      longitude: lon + 0.008,
      status: "FULL",
    },
    {
      id: "machine-4",
      latitude: lat - 0.004,
      longitude: lon + 0.0055,
      status: "AVAILABLE",
    },
    {
      id: "machine-5",
      latitude: lat + 0.0065,
      longitude: lon + 0.0025,
      status: "AVAILABLE",
    },
    {
      id: "machine-6",
      latitude: lat - 0.0025,
      longitude: lon - 0.0085,
      status: "OUT_OF_ORDER",
    },
    {
      id: "machine-7",
      latitude: lat + 0.0035,
      longitude: lon - 0.002,
      status: "AVAILABLE",
    },
    {
      id: "machine-8",
      latitude: lat - 0.007,
      longitude: lon + 0.0015,
      status: "FULL",
    },
    {
      id: "machine-9",
      latitude: lat + 0.0008,
      longitude: lon + 0.0035,
      status: "AVAILABLE",
    },
    // Far left / right so the map edges are not empty.
    {
      id: "machine-10",
      latitude: lat + 0.004,
      longitude: lon - 0.012,
      status: "AVAILABLE",
    },
    {
      id: "machine-11",
      latitude: lat - 0.003,
      longitude: lon - 0.0135,
      status: "AVAILABLE",
    },
    {
      id: "machine-12",
      latitude: lat + 0.001,
      longitude: lon - 0.0105,
      status: "FULL",
    },
    {
      id: "machine-13",
      latitude: lat - 0.0055,
      longitude: lon - 0.011,
      status: "AVAILABLE",
    },
    {
      id: "machine-14",
      latitude: lat + 0.005,
      longitude: lon + 0.0125,
      status: "AVAILABLE",
    },
    {
      id: "machine-15",
      latitude: lat - 0.0015,
      longitude: lon + 0.013,
      status: "AVAILABLE",
    },
    {
      id: "machine-16",
      latitude: lat + 0.0025,
      longitude: lon + 0.0105,
      status: "OUT_OF_ORDER",
    },
    {
      id: "machine-17",
      latitude: lat - 0.0065,
      longitude: lon + 0.0115,
      status: "AVAILABLE",
    },
  ];
}

const MAP_DELTA = 0.022;

function DemoOfferBubble({
  quantity,
  income,
}: {
  quantity: number;
  income: number;
}) {
  return (
    <View style={styles.markerContainer}>
      <View style={styles.bubble}>
        <Text style={styles.bubbleText} numberOfLines={1}>
          {quantity} sztuk +{formatPrice(income)}
        </Text>
      </View>
      <View style={styles.triangle} />
      <View style={styles.markerCore} />
    </View>
  );
}

/** Matches ReservedOfferMarker on the home map. */
function DemoReservedBubble({
  quantity,
  income,
}: {
  quantity: number;
  income: number;
}) {
  return (
    <View style={styles.markerContainer}>
      <View style={styles.reservedBubble}>
        <Text style={styles.reservedLabel} numberOfLines={1}>
          Twoja rezerwacja
        </Text>
        <Text style={styles.reservedBubbleText} numberOfLines={1}>
          {quantity} sztuk +{formatPrice(income)}
        </Text>
      </View>
      <View style={styles.reservedTriangle} />
      <View style={styles.reservedMarkerCore} />
    </View>
  );
}

type OnboardingMapPreviewProps = {
  /** When set, that demo offer uses the green reserved marker style. */
  reservedOfferId?: string;
  /** Show deposit-machine pins instead of offer bubbles. */
  variant?: "offers" | "machines";
};

/**
 * Real MapView preview for onboarding — same bubble / machine markers as the home map,
 * centered on the user when possible.
 */
export default function OnboardingMapPreview({
  reservedOfferId,
  variant = "offers",
}: OnboardingMapPreviewProps) {
  const [userCenter, setUserCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [tracksViewChanges, setTracksViewChanges] = useState(
    Platform.OS === "android",
  );

  useEffect(() => {
    let cancelled = false;

    const resolveCenter = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (!cancelled) {
            setUserCenter({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
          return;
        }
      } catch {
        // Fall through to default city center.
      }
      if (!cancelled) {
        setUserCenter(FALLBACK_CENTER);
      }
    };

    void resolveCenter();
    return () => {
      cancelled = true;
    };
  }, []);

  // If permission arrives just after mount (B1 prompt), retry once shortly after.
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") return;
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserCenter({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch {
        // Keep current center.
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const reservedPosition = useMemo(
    () => (userCenter ? getReservedOfferPosition(userCenter) : null),
    [userCenter],
  );

  /** Offers: center on user. Machines: center on the reserved-offer pickup spot. */
  const mapRegion = useMemo<Region | null>(() => {
    if (!userCenter) return null;
    const focus =
      variant === "machines" && reservedPosition
        ? reservedPosition
        : userCenter;
    return {
      latitude: focus.latitude,
      longitude: focus.longitude,
      latitudeDelta: MAP_DELTA,
      longitudeDelta: MAP_DELTA,
    };
  }, [userCenter, reservedPosition, variant]);

  useEffect(() => {
    if (Platform.OS !== "android" || !mapRegion) return;
    const t = setTimeout(() => setTracksViewChanges(false), 600);
    return () => clearTimeout(t);
  }, [mapRegion]);

  const offers = useMemo(
    () =>
      userCenter && variant === "offers" ? buildDemoOffers(userCenter) : [],
    [userCenter, variant],
  );

  const machines = useMemo(
    () =>
      reservedPosition && variant === "machines"
        ? buildDemoMachines(reservedPosition)
        : [],
    [reservedPosition, variant],
  );

  return (
    <View style={styles.wrapper} pointerEvents="none">
      {mapRegion ? (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={StyleSheet.absoluteFill}
          initialRegion={mapRegion}
          region={mapRegion}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          showsCompass={false}
          showsScale={false}
          showsPointsOfInterest={false}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          showsMyLocationButton={false}
          // Real GPS would stay at the old spot — B5 fakes "you are here" at the reserved offer.
          showsUserLocation={variant !== "machines"}
          moveOnMarkerPress={false}
          liteMode={false}
        >
          {variant === "machines" && reservedPosition ? (
            <Marker
              coordinate={reservedPosition}
              tracksViewChanges={tracksViewChanges}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={30}
            >
              <View style={styles.userLocationOuter}>
                <View style={styles.userLocationInner} />
              </View>
            </Marker>
          ) : null}
          {offers.map((offer) => {
            const isReserved = offer.id === reservedOfferId;
            return (
              <Marker
                key={offer.id}
                coordinate={{
                  latitude: offer.latitude,
                  longitude: offer.longitude,
                }}
                tracksViewChanges={tracksViewChanges}
                anchor={{ x: 0.5, y: 1 }}
                centerOffset={{ x: 0, y: -20 }}
                zIndex={isReserved ? 20 : 10}
              >
                {isReserved ? (
                  <DemoReservedBubble
                    quantity={offer.totalQuantity}
                    income={offer.totalIncome}
                  />
                ) : (
                  <DemoOfferBubble
                    quantity={offer.totalQuantity}
                    income={offer.totalIncome}
                  />
                )}
              </Marker>
            );
          })}
          {machines.map((machine) => (
            <Marker
              key={machine.id}
              coordinate={{
                latitude: machine.latitude,
                longitude: machine.longitude,
              }}
              tracksViewChanges={tracksViewChanges}
              anchor={{ x: 0.5, y: 1 }}
              centerOffset={{ x: 0, y: -20 }}
            >
              <Image
                source={MACHINE_MARKER_IMAGES[machine.status]}
                style={styles.machinePin}
                resizeMode="contain"
                fadeDuration={0}
              />
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 220,
    borderRadius: rounded.xl,
    overflow: "hidden",
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary.base,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  bubbleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333333",
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
    backgroundColor: colors.primary.base,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  reservedBubble: {
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
  reservedLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.white,
    letterSpacing: -0.1,
  },
  reservedBubbleText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.white,
  },
  reservedTriangle: {
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
  reservedMarkerCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.text.white,
    borderWidth: 2,
    borderColor: colors.primary.base,
  },
  machinePin: {
    width: 50,
    height: 50,
  },
  userLocationOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0, 122, 255, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  userLocationInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#007AFF",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
});
