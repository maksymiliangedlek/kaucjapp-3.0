import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";

const FALLBACK = {
  latitude: 50.0614,
  longitude: 19.9373,
};

export function useStartLocation() {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (requestIfNeeded: boolean) => {
    setIsLoading(true);
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted" && requestIfNeeded) {
        ({ status } = await Location.requestForegroundPermissionsAsync());
      }
      const granted = status === "granted";
      setPermissionGranted(granted);
      if (!granted) {
        setCoords(FALLBACK);
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch {
      setCoords(FALLBACK);
      setPermissionGranted(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  return {
    coords,
    permissionGranted,
    isLoading,
    requestPermission: () => refresh(true),
    usingFallback: permissionGranted === false,
  };
}
