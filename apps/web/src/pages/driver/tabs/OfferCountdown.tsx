import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

export function OfferCountdown({ expiresAt }: { expiresAt: string }) {
  const { t } = useTranslation();
  const [left, setLeft] = useState(0);

  useEffect(() => {
    function tick() {
      const end = new Date(expiresAt).getTime();
      const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setLeft(s);
    }
    tick();
    const id = window.setInterval(tick, 500);
    return () => clearInterval(id);
  }, [expiresAt]);

  const urgent = left <= 10;

  return (
    <span
      className={cn(
        "inline-flex min-w-[3rem] items-center justify-center rounded-full px-2 py-0.5 font-mono text-xs font-semibold",
        urgent ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900",
      )}
    >
      {t("driver.dashboard.available.countdownSeconds", { count: left })}
    </span>
  );
}
