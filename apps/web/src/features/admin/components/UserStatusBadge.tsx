import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  suspended: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  banned: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
};

export function UserStatusBadge({ status }: { status: "active" | "suspended" | "banned" }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[status] ?? STYLES.active,
      )}
    >
      {t(`admin.users.userStatus.${status}`)}
    </span>
  );
}
