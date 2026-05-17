import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

type DriverStatus = "online" | "offline" | "on_delivery" | "suspended";

const STYLES: Record<DriverStatus, string> = {
  online: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  offline: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200",
  on_delivery: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  suspended: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
};

export function DriverStatusBadge({ status }: { status: DriverStatus }) {
  const { t } = useTranslation();
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", STYLES[status])}>
      {t(`admin.drivers.driverStatus.${status}`)}
    </span>
  );
}
