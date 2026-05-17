import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import type { DriverDocument } from "@/pages/driver/driverMock";

export function DriverVerificationBanner({ documents }: { documents: DriverDocument[] }) {
  const { t } = useTranslation();
  const problems = documents.filter((d) => d.status === "expired" || d.status === "missing");
  if (problems.length === 0) return null;

  const labels = problems.map((d) => t(`driver.dashboard.documents.${d.id}`, { defaultValue: d.label }));

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">{t("driver.dashboard.verification.title")}</p>
          <p className="text-sm text-amber-900/90">{t("driver.dashboard.verification.body", { documents: labels.join(", ") })}</p>
        </div>
      </div>
      <Button variant="outline" className="shrink-0 border-amber-400 bg-white" asChild>
        <Link to="/dashboard/driver/vehicle">{t("driver.dashboard.verification.cta")}</Link>
      </Button>
    </div>
  );
}
