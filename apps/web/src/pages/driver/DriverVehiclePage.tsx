import { BadgeCheck, FileUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MOCK_DOCUMENTS, type DriverDocument } from "@/pages/driver/driverMock";

function statusBadge(d: DriverDocument) {
  switch (d.status) {
    case "verified":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "expired":
      return "border-red-200 bg-red-50 text-red-800";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function formatDocExpiry(iso: string | null, lang: string): string | null {
  if (!iso) return null;
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return null;
  const loc = lang.toLowerCase().startsWith("ar") ? "ar-IQ" : "en-IQ";
  return t.toLocaleDateString(loc, { dateStyle: "medium", numberingSystem: "latn" });
}

export function DriverVehiclePage() {
  const { t, i18n: i18next } = useTranslation();
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("driver.vehicle.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("driver.vehicle.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MOCK_DOCUMENTS.map((d) => {
          const title = t(`driver.dashboard.documents.${d.id}`, { defaultValue: d.label });
          const statusLabel = t(`driver.vehicle.docStatus.${d.status}`);
          const expiryFmt = formatDocExpiry(d.expiresAt, i18next.language);
          const desc = expiryFmt ? t("driver.vehicle.expiresOn", { date: expiryFmt }) : t("driver.vehicle.noExpiry");
          return (
            <Card key={d.id} className="shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
                      statusBadge(d),
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileUp className="h-4 w-4 text-primary" />
            {t("driver.vehicle.uploadTitle")}
          </CardTitle>
          <CardDescription>{t("driver.vehicle.uploadHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setBusy(true);
              window.setTimeout(() => {
                setBusy(false);
                toast.success(i18next.t("toasts.documentsSubmittedDemo"));
              }, 600);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="lic">{t("driver.dashboard.documents.d1")}</Label>
              <Input id="lic" type="file" accept="image/*,application/pdf" className="mt-1.5 min-h-11" />
            </div>
            <div>
              <Label htmlFor="reg">{t("driver.dashboard.documents.d2")}</Label>
              <Input id="reg" type="file" accept="image/*,application/pdf" className="mt-1.5 min-h-11" />
            </div>
            <div>
              <Label htmlFor="ins">{t("driver.dashboard.documents.d3")}</Label>
              <Input id="ins" type="file" accept="image/*,application/pdf" className="mt-1.5 min-h-11" />
            </div>
            <Button type="submit" className="min-h-12 bg-[#2563eb] hover:bg-[#2563eb]/90" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              {t("driver.vehicle.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-dashed shadow-sm">
        <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <BadgeCheck className="h-8 w-8 shrink-0 text-[#2563eb]" />
          {t("driver.vehicle.verifiedPerks")}
        </CardContent>
      </Card>
    </div>
  );
}
