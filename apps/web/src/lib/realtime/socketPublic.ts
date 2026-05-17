import { io, type Socket } from "socket.io-client";

import { env } from "@/config/env";

function toSocketIoHttpUrl(url: string): string {
  if (url.startsWith("ws://")) return `http://${url.slice(5)}`;
  if (url.startsWith("wss://")) return `https://${url.slice(6)}`;
  return url;
}

let publicSocket: Socket | null = null;

/** Anonymous Socket.IO session for shipment rooms (JWT optional on server). */
export function ensurePublicShipmentSocket(): Socket {
  const url = toSocketIoHttpUrl(env.VITE_WS_URL);
  if (!publicSocket) {
    publicSocket = io(url, {
      auth: {},
      transports: ["websocket", "polling"],
      reconnection: true,
      autoConnect: false,
    });
  }
  if (!publicSocket.connected) void publicSocket.connect();
  return publicSocket;
}

export function disconnectPublicShipmentSocket(): void {
  publicSocket?.removeAllListeners();
  publicSocket?.disconnect();
  publicSocket = null;
}
