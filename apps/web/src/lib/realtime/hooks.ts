import { useEffect } from "react";

import { getSocket } from "@/lib/realtime/socket";

export function useSocket() {
  return getSocket();
}

export function useSocketEvent<T = unknown>(event: string, handler: (payload: T) => void) {
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const fn = (payload: T) => {
      handler(payload);
    };
    s.on(event, fn);
    return () => {
      s.off(event, fn);
    };
  }, [event, handler]);
}
