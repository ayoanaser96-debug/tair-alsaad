import { useCallback, useEffect, useState } from "react";

const KEY = "tairalsaad_driver_online";

export function useDriverOnline() {
  const [online, setOnlineState] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "0") setOnlineState(false);
      if (v === "1") setOnlineState(true);
    } catch {
      /* ignore */
    }
  }, []);

  const setOnline = useCallback((next: boolean) => {
    setOnlineState(next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  return { online, setOnline };
}
