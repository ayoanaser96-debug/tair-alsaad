import { useEffect } from 'react';

import { HttpApiError } from '@/lib/api';
import { draftToQuoteBody } from '@/lib/shipmentDraft';
import { postQuote } from '@/queries/shipments';
import { useDraftShipmentStore } from '@/stores/draftShipmentStore';
import { useShallow } from 'zustand/react/shallow';

/** POST /shipments/quote whenever draft fields meaningfully change; debounced ~400ms. */
export function useDebouncedShipmentQuote() {
  const { pickup, dropoff, pkg, service, scheduledForIso, setLastQuote } = useDraftShipmentStore(
    useShallow((s) => ({
      pickup: s.pickup,
      dropoff: s.dropoff,
      pkg: s.package,
      service: s.service,
      scheduledForIso: s.scheduledForIso,
      setLastQuote: s.setLastQuote,
    })),
  );

  const token = `${pickup.location.lat}:${pickup.location.lng}:${pickup.city}:${pickup.area}:${dropoff.location.lat}:${dropoff.location.lng}:${dropoff.city}:${dropoff.area}:${pkg.type}:${pkg.weightTier}:${service}:${scheduledForIso ?? ''}`;

  useEffect(() => {
    let cancelled = false;
    const body = draftToQuoteBody({
      pickup,
      dropoff,
      package: pkg,
      service,
      scheduledForIso,
    });

    const timer = setTimeout(() => {
      if (!body) {
        setLastQuote(null, null);
        return;
      }
      void (async () => {
        try {
          const quote = await postQuote(body);
          if (!cancelled) setLastQuote(quote, null);
        } catch (e: unknown) {
          if (!cancelled) {
            const code =
              e instanceof HttpApiError
                ? e.code
                : typeof e === 'object' &&
                    e !== null &&
                    'code' in e &&
                    typeof (e as { code?: unknown }).code === 'string'
                  ? (e as { code: string }).code
                  : 'UNKNOWN';
            setLastQuote(null, code);
          }
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [dropoff, pickup, pkg, scheduledForIso, service, setLastQuote, token]);
}
