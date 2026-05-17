import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import i18n from "@/i18n/config";

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
        onError: (err) => {
          const msg = err instanceof Error ? err.message : i18n.t("toasts.requestFailed");
          toast.error(msg);
        },
      },
    },
  });
}
