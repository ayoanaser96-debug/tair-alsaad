import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { quoteShipmentApi } from "@/features/orders/api";
import type { QuoteInput } from "@/features/orders/createSchemas";
import { useAuthStore } from "@/features/auth/store";

function useDebounced<T>(value: T, ms = 600): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/**
 * Live quote for POST /shipments/quote. Pass `null` until pickup pin + city +
 * dropoff pin + city + package/service are all set. No retry: a 4xx on partial
 * input must not retry-spam.
 */
export function useQuote(input: QuoteInput | null) {
  const token = useAuthStore((s) => s.accessToken);
  const debounced = useDebounced(input);
  return useQuery({
    queryKey: ["shipments", "quote", debounced],
    enabled: !!token && debounced != null,
    staleTime: 30_000,
    retry: false,
    queryFn: () => quoteShipmentApi(debounced as QuoteInput),
  });
}
