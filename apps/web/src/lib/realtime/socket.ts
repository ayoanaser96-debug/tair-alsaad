import { io, type Socket } from "socket.io-client";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { env } from "@/config/env";
import { orderKeys } from "@/features/orders/hooks";
import i18n from "@/i18n/config";

let socket: Socket | null = null;
let queryClientRef: QueryClient | null = null;

function toSocketIoHttpUrl(url: string): string {
  if (url.startsWith("ws://")) return `http://${url.slice(5)}`;
  if (url.startsWith("wss://")) return `https://${url.slice(6)}`;
  return url;
}

export function setRealtimeQueryClient(qc: QueryClient) {
  queryClientRef = qc;
}

export function connectRealtime(getToken: () => string | null) {
  const token = getToken();
  if (!token) return;

  if (socket?.connected) return;

  const url = toSocketIoHttpUrl(env.VITE_WS_URL);

  socket = io(url, {
    auth: { token },
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30_000,
    randomizationFactor: 0.5,
  });

  socket.on("connect", () => {
    /* connected */
  });

  socket.on("connect_error", async (err: Error) => {
    const msg = err?.message ?? String(err);
    if (/jwt|unauthor|invalid token|forbidden|expired/i.test(msg)) {
      const { useAuthStore } = await import("@/features/auth/store");
      useAuthStore.getState().clearAuth();
      toast.error(i18n.t("toasts.realtimeRejected"));
    }
  });

  socket.on("order:update", () => {
    void queryClientRef?.invalidateQueries({ queryKey: orderKeys.all });
  });

  socket.on("shipment:status", () => {
    void queryClientRef?.invalidateQueries({ queryKey: orderKeys.all });
  });

  socket.on("shipment:driver_assigned", () => {
    void queryClientRef?.invalidateQueries({ queryKey: orderKeys.all });
  });

  socket.on("shipment:eta", () => {
    void queryClientRef?.invalidateQueries({ queryKey: orderKeys.all });
  });

  socket.on("shipment:driver_location", () => {
    void queryClientRef?.invalidateQueries({ queryKey: orderKeys.all });
  });

  socket.on("admin:driver_location", () => {
    void queryClientRef?.invalidateQueries({ queryKey: ["admin"] });
    void queryClientRef?.invalidateQueries({ queryKey: orderKeys.all });
  });

  socket.on("notification:new", (payload: unknown) => {
    void queryClientRef?.invalidateQueries({ queryKey: orderKeys.notifications() });
    if (payload && typeof payload === "object" && "title" in payload) {
      const t = (payload as { title?: string }).title;
      if (t) toast.message(t);
    }
  });

  socket.connect();
}

export function disconnectRealtime() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
