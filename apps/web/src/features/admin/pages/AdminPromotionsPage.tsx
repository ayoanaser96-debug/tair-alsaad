import { zodResolver } from "@hookform/resolvers/zod";
import { Gift } from "lucide-react";
import { useMemo, useState } from "react";
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
import { createPromoFormSchema, type PromoFormValues } from "@/features/admin/formSchemas";
import { formatAppCurrency } from "@/lib/utils";

const EXISTING = [
  { code: "WELCOME10", uses: 120, ends: "2026-06-01" },
  { code: "REF50", uses: 34, ends: "2026-05-15" },
];

function PromotionsCreateForm({
  onCreated,
}: {
  onCreated: (row: { code: string; uses: number; ends: string }) => void;
}) {
  const { t, i18n } = useTranslation();
  const schema = useMemo(() => createPromoFormSchema(t), [t, i18n.language]);
  const form = useForm<PromoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      discountType: "percent",
      value: 10,
      minOrder: 0,
      usageLimit: 1000,
      expires: "2026-12-31",
      audience: "all",
    },
  });

  const watch = form.watch();
  const preview = useMemo(() => {
    const v = watch.value ?? 0;
    if (watch.discountType === "percent") return t("admin.promotions.previewPercent", { v });
    return t("admin.promotions.previewFixed", { amount: formatAppCurrency(v, i18n.language) });
  }, [watch.discountType, watch.value, t, i18n.language]);

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gift className="h-5 w-5 text-primary" />
          {t("admin.promotions.newTitle")}
        </CardTitle>
        <CardDescription>{t("admin.promotions.newDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((data) => {
            onCreated({ code: data.code, uses: 0, ends: data.expires });
            toast.success(i18n.t("toasts.promoCreated", { code: data.code }));
            form.reset({ ...form.getValues(), code: "" });
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">{t("admin.promotions.code")}</Label>
              <Input id="code" {...form.register("code")} placeholder="SUMMER26" />
              {form.formState.errors.code ? (
                <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>{t("admin.promotions.discountType")}</Label>
              <NativeSelect {...form.register("discountType")}>
                <option value="percent">{t("admin.promotions.discountPercent")}</option>
                <option value="fixed">{t("admin.promotions.discountFixed")}</option>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">{t("admin.promotions.value")}</Label>
              <Input id="value" type="number" step="0.01" {...form.register("value")} />
              {form.formState.errors.value ? (
                <p className="text-xs text-destructive">{form.formState.errors.value.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrder">{t("admin.promotions.minOrder")}</Label>
              <Input id="minOrder" type="number" {...form.register("minOrder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usageLimit">{t("admin.promotions.usageLimit")}</Label>
              <Input id="usageLimit" type="number" {...form.register("usageLimit")} />
              {form.formState.errors.usageLimit ? (
                <p className="text-xs text-destructive">{form.formState.errors.usageLimit.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires">{t("admin.promotions.expiry")}</Label>
              <Input id="expires" type="date" {...form.register("expires")} />
              {form.formState.errors.expires ? (
                <p className="text-xs text-destructive">{form.formState.errors.expires.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("admin.promotions.audience")}</Label>
              <NativeSelect {...form.register("audience")}>
                <option value="all">{t("admin.promotions.audienceAll")}</option>
                <option value="new">{t("admin.promotions.audienceNew")}</option>
                <option value="referral">{t("admin.promotions.audienceReferral")}</option>
              </NativeSelect>
            </div>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <span className="text-muted-foreground">{t("admin.promotions.previewLabel")} </span>
            {preview}
          </div>
          <Button type="submit">{t("admin.promotions.savePromotion")}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminPromotionsPage() {
  const { t, i18n } = useTranslation();
  const [codes, setCodes] = useState(EXISTING);

  return (
    <PermissionGate page="promotions">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.promotions.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.promotions.subtitle")}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <PromotionsCreateForm key={i18n.language} onCreated={(row) => setCodes((c) => [row, ...c])} />

          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">{t("admin.promotions.performanceTitle")}</CardTitle>
              <CardDescription>{t("admin.promotions.performanceDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {codes.map((c) => (
                  <li key={c.code} className="flex justify-between py-3 text-sm first:pt-0">
                    <span className="font-mono font-medium">{c.code}</span>
                    <span className="text-muted-foreground">
                      {t("admin.promotions.usesEnds", { uses: c.uses, ends: c.ends })}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGate>
  );
}
