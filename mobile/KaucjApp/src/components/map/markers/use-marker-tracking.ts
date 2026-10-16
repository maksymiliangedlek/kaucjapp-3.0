import { useCallback, useEffect, useState } from "react";

// Dense map remounts (filter change with many pins) need a longer window
// before the native snapshot freezes — 600ms was too short in production.
const TRACKING_FALLBACK_MS = 1200;

// this hook manages the tracking of the marker - it is used to avoid the marker from freezing (snapshot) when the content changes
export function useMarkerTracking(contentKey: string | number) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    setTracksViewChanges(true);
    const timeout = setTimeout(
      () => setTracksViewChanges(false),
      TRACKING_FALLBACK_MS,
    );
    return () => clearTimeout(timeout);
  }, [contentKey]);

  const onRendered = useCallback(() => {
    setTracksViewChanges(false);
  }, []);

  return { tracksViewChanges, onRendered };
}
