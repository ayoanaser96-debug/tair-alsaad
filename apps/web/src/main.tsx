import i18n from "@/i18n/config";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";

import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "@/config/env";
import { AuthProvider } from "@/context/AuthContext";
import { createAppQueryClient } from "@/lib/queryClient";
import { setRealtimeQueryClient } from "@/lib/realtime/socket";

import App from "./App";
import "./index.css";

try {
  if (localStorage.getItem("tairalsaad_theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
} catch {
  /* ignore */
}

const queryClient = createAppQueryClient();
setRealtimeQueryClient(queryClient);

async function enableMocking() {
  if (!env.VITE_USE_MOCKS) return;
  const { worker } = await import("@/lib/api/mock/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

void enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <TooltipProvider delayDuration={300}>
                <App />
              </TooltipProvider>
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </BrowserRouter>
          {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        </QueryClientProvider>
      </I18nextProvider>
    </StrictMode>,
  );
});
