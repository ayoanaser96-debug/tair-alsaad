import type { Socket } from 'socket.io-client';

import Constants from 'expo-constants';
import { io } from 'socket.io-client';

import { socketOriginFromApiBase } from '@/lib/socketUrl';
import { useAuthStore } from '@/stores/authStore';

/** Single Socket.IO connection for driver tabs (requests + pings). */
let socket: Socket | undefined;

export function getDriverIo(): Socket | undefined {
  return socket;
}

export function connectDriverIo(): Socket | undefined {
  const token = useAuthStore.getState().accessToken;
  if (!token) return undefined;

  const apiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (!apiUrl) return undefined;

  const origin = socketOriginFromApiBase(apiUrl);

  if (socket?.connected) return socket;

  socket?.removeAllListeners();
  socket?.disconnect();

  socket = io(origin, {
    transports: ['websocket'],
    auth: { token },
  });

  return socket;
}

export function disconnectDriverIo() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = undefined;
}

/** Location ping uses the same socket as `driver:location` on the server. */
export function emitDriverLocation(lat: number, lng: number) {
  socket?.emit('driver:location', { lat, lng });
}
