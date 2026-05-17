import { zodResolver } from "@hookform/resolvers/zod";
import { Percent } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { PermissionGate } from "@/features/admin/components/PermissionGate";
import { createPricingFormSchema, type PricingFormValues } from "@/features/admin/formSchemas";
import { formatAppCurrency } from "@/lib/utils";

function PricingFormCard() {
  const { t, i18n } = useTranslation();
  const schema = useMemo(() => createPricingFormSchema(t), [t, i18n.language]);
  const form = useForm<PricingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      baseFare: 5,
      perKm: 2.2,
      perKg: 0.5,
      minFare: 8,
      peakSurge: 1.25,
      packageType: "standard",
    },
  });

  const v = form.watch();
  const preview = useMemo(() => {
    const km = 12;
    const kg = 3;
    const surge = v.peakSurge ?? 1;
    const raw = (v.baseFare ?? 0) + km * (v.perKm ?? 0) + kg * (v.perKg ?? 0);
    const total = Math.max(v.minFare ?? 0, raw * surge);
    return { km, kg, total };
  }, [v.baseFare, v.minFare, v.peakSurge, v.perKm, v.perKg]);

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Percent className="h-5 w-5 text-primary" />
          {t("admin.pricing.tariffTitle")}
        </CardTitle>
        <CardDescription>{t("admin.pricing.tariffDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(() => {
            toast.success(i18n.t("toasts.pricingSavedDemo"));
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("admin.pricing.packageType")}</Label>
              <NativeSelect {...form.register("packageType")}>
                <option value="standard">{t("admin.pricing.pkgStandard")}</option>
                <option value="express">{t("admin.pricing.pkgExpress")}</option>
                <option value="fragile">{t("admin.pricing.pkgFragile")}</option>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseFare">{t("admin.pricing.baseFare")}</Label>
              <Input id="baseFare" type="number" step="0.01" {...form.register("baseFare")} />
              {form.formState.errors.baseFare ? (
                <p className="text-xs text-destructive">{form.formState.errors.baseFare.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="perKm">{t("admin.pricing.perKm")}</Label>
              <Input id="perKm" type="number" step="0.01" {...form.register("perKm")} />
              {form.formState.errors.perKm ? (
                <p className="text-xs text-destructive">{form.formState.errors.perKm.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="perKg">{t("admin.pricing.perKg")}</Label>
              <Input id="perKg" type="number" step="0.01" {...form.register("perKg")} />
              {form.formState.errors.perKg ? (
                <p className="text-xs text-destructive">{form.formState.errors.perKg.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minFare">{t("admin.pricing.minFare")}</Label>
              <Input id="minFare" type="number" step="0.01" {...form.register("minFare")} />
              {form.formState.errors.minFare ? (
                <p className="text-xs text-destructive">{form.formState.errors.minFare.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="peakSurge">{t("admin.pricing.peakSurge")}</Label>
              <Input id="peakSurge" type="number" step="0.05" {...form.register("peakSurge")} />
              {form.formState.errors.peakSurge ? (
                <p className="text-xs text-destructive">{form.formState.errors.peakSurge.message}</p>
              ) : null}
            </div>
          </div>
          <div className="rounded-xl border bg-muted/40 p-4 text-sm">
            <p className="font-medium">{t("admin.pricing.previewTitle")}</p>
            <p className="mt-1 text-muted-foreground">
              {t("admin.pricing.previewLine", {
                km: preview.km,
                kg: preview.kg,
                total: formatAppCurrency(preview.total, i18n.language),
              })}
            </p>
          </div>
          <Button type="submit">{t("admin.pricing.savePricing")}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminPricingPage() {
  const { t, i18n } = useTranslation();

  return (
    <PermissionGate page="pricing">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.pricing.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.pricing.subtitle")}</p>
        </div>

        <PricingFormCard key={i18n.language} />
      </div>
    </PermissionGate>
  );
}
