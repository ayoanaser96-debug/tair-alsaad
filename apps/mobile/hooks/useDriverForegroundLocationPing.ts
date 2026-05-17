import { useEffect } from 'react';

import * as Location from 'expo-location';

import { emitDriverLocation } from '@/lib/driverIo';

/** Emit `driver:location` on the socket every ~5s while enabled (foreground). */
export function useDriverForegroundLocationPing(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      const fg = await Location.getForegroundPermissionsAsync();
      if (fg.status !== 'granted') return;
      try {
        const cur = await Location.getCurrentPositionAsync({});
        emitDriverLocation(cur.coords.latitude, cur.coords.longitude);
      } catch {
        /* ignore transient GPS errors */
      }
    };

    void tick();
    const id = setInterval(() => void tick(), 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled]);
}
