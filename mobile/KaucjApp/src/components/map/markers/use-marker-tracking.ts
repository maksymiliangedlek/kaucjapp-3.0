import { useCallback, useEffect, useRef, useState } from "react";

// Hard stop so tracking can't stay on forever if onLayout never settles.
const TRACKING_FALLBACK_MS = 1500;
// onLayout fires before MKMapView has a usable bitmap under dense remounts —
// freezing immediately is what blanks offer bubbles on production.
const TRACKING_AFTER_LAYOUT_MS = 400;

// Tracks custom Marker children until the native snapshot is safe to freeze.
export function useMarkerTracking(contentKey: string | number) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleStop = useCallback((delayMs: number) => {
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(() => {
      stopTimeoutRef.current = null;
      setTracksViewChanges(false);
    }, delayMs);
  }, []);

  useEffect(() => {
    setTracksViewChanges(true);
    scheduleStop(TRACKING_FALLBACK_MS);
    return () => {
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [contentKey, scheduleStop]);

  const onRendered = useCallback(() => {
    scheduleStop(TRACKING_AFTER_LAYOUT_MS);
  }, [scheduleStop]);

  return { tracksViewChanges, onRendered };
}
