import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { MapFilter } from "@/src/types";
import { useMapMarkers } from "./use-map-markers";
import { useMapRegion } from "./use-map-region";
import { useMapSearch } from "./use-map-search";
import { useMapSelection } from "./use-map-selection";
import { useMapErrors } from "./use-map-errors";

function parseMapFilter(value: string | string[] | undefined): MapFilter | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "all" || raw === "offers" || raw === "machines") return raw;
  return null;
}

export function useMapController() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const [filter, setFilter] = useState<MapFilter>(
    () => parseMapFilter(params.filter) ?? "all",
  );

  useEffect(() => {
    const next = parseMapFilter(params.filter);
    if (next) setFilter(next);
  }, [params.filter]);

  const { initialRegion, isLocationLoading, setRegion, bbox } = useMapRegion();

  const { offersQuery, machinesQuery, isFetching } = useMapSearch({
    bbox,
    filter,
  });

  const { offers, reservedOffers, machines } = useMapMarkers(filter);

  const offersError = {
    isError: offersQuery.isError,
    error: offersQuery.error,
    refetch: offersQuery.refetch,
  };
  const machinesError = {
    isError: machinesQuery.isError,
    error: machinesQuery.error,
    refetch: machinesQuery.refetch,
  };

  const errors = useMapErrors({ filter, offersError, machinesError });

  const selection = useMapSelection();

  return {
    // filtering
    filter,
    setFilter,

    // camera / loading
    initialRegion,
    isLocationLoading,
    onRegionChange: setRegion,

    // marker data
    offers,
    reservedOffers,
    machines,
    isFetching,

    // error surfaces for each category
    errors,

    // this is the bridge between the map and the bottom sheet.
    selection,
  };
}
