import type { Socket } from 'socket.io-client';

import Constants from 'expo-constants';
import { io } from 'socket.io-client';

import { socketOriginFromApiBase } from '@/lib/socketUrl';

/** Anonymous Socket.IO client for `shipment:subscribe` (JWT optional on server). */
let socket: Socket | undefined;

export function connectPublicShipmentSocket(): Socket | undefined {
  const apiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (!apiUrl) return undefined;

  const origin = socketOriginFromApiBase(apiUrl);

  if (socket?.connected) return socket;

  socket?.removeAllListeners();
  socket?.disconnect();

  socket = io(origin, {
    transports: ['websocket'],
    auth: {},
  });

  return socket;
}

export function disconnectPublicShipmentSocket(): void {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = undefined;
}
