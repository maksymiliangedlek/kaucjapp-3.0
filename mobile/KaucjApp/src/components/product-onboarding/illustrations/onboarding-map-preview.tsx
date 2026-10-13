import React, { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";
import * as Location from "expo-location";
import { colors, rounded } from "@/src/theme";
import { formatPrice } from "@/src/lib";

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

function buildDemoOffers(center: { latitude: number; longitude: number }): DemoOffer[] {
  const { latitude: lat, longitude: lon } = center;
  return [
    {
      id: "demo-1",
      latitude: lat + 0.0018,
      longitude: lon - 0.0004,
      totalQuantity: 10,
      totalIncome: 3,
    },
    {
      id: "demo-2",
      latitude: lat - 0.0012,
      longitude: lon - 0.0022,
      totalQuantity: 16,
      totalIncome: 4,
    },
    {
      id: "demo-3",
      latitude: lat - 0.0006,
      longitude: lon + 0.0024,
      totalQuantity: 20,
      totalIncome: 4.3,
    },
    {
      id: "demo-4",
      latitude: lat + 0.0011,
      longitude: lon + 0.0016,
      totalQuantity: 12,
      totalIncome: 3.5,
    },
  ];
}

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

/**
 * Real MapView preview for onboarding B1 — same bubble markers as the home map,
 * centered on the user when possible.
 */
export default function OnboardingMapPreview() {
  const [region, setRegion] = useState<Region | null>(null);
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
            setRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.012,
              longitudeDelta: 0.012,
            });
          }
          return;
        }
      } catch {
        // Fall through to default city center.
      }
      if (!cancelled) {
        setRegion({
          ...FALLBACK_CENTER,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        });
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
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        });
      } catch {
        // Keep current region.
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android" || !region) return;
    const t = setTimeout(() => setTracksViewChanges(false), 600);
    return () => clearTimeout(t);
  }, [region]);

  const offers = useMemo(
    () =>
      region
        ? buildDemoOffers({
            latitude: region.latitude,
            longitude: region.longitude,
          })
        : [],
    [region],
  );

  return (
    <View style={styles.wrapper} pointerEvents="none">
      {region ? (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          region={region}
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
          showsUserLocation
          moveOnMarkerPress={false}
          liteMode={false}
        >
          {offers.map((offer) => (
            <Marker
              key={offer.id}
              coordinate={{
                latitude: offer.latitude,
                longitude: offer.longitude,
              }}
              tracksViewChanges={tracksViewChanges}
              anchor={{ x: 0.5, y: 1 }}
              centerOffset={{ x: 0, y: -20 }}
            >
              <DemoOfferBubble
                quantity={offer.totalQuantity}
                income={offer.totalIncome}
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
});
