import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Camera,
  Check,
  MapPin,
  MessageCircle,
  Navigation,
  Package,
  PenLine,
  Phone,
} from "lucide-react";
import type { TFunction } from "i18next";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import i18n from "@/i18n/config";
import { formatAppCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useActiveDelivery } from "@/pages/driver/DriverDeliveryContext";
import type { DeliveryStep } from "@/pages/driver/driverMock";

const DELIVERY_STEP_ORDER: DeliveryStep[] = [
  "navigate_pickup",
  "arrived_pickup",
  "picked_up",
  "navigate_delivery",
  "arrived_delivery",
  "delivered",
];

const REPORT_CATEGORIES = ["damaged", "wrong_address", "recipient_unavailable", "other"] as const;

function createReportSchema(t: TFunction) {
  return z.object({
    category: z.enum(REPORT_CATEGORIES),
    note: z
      .string()
      .min(1, { message: t("driver.activeDelivery.dialog.validation.noteRequired") })
      .max(2000, { message: t("driver.activeDelivery.dialog.validation.noteMax") }),
  });
}

type ReportForm = z.infer<ReturnType<typeof createReportSchema>>;

function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function ReportIssueForm({ onDismiss }: { onDismiss: () => void }) {
  const { t, i18n } = useTranslation();
  const schema = useMemo(() => createReportSchema(t), [t, i18n.language]);
  const form = useForm<ReportForm>({
    resolver: zodResolver(schema),
    defaultValues: { category: "other", note: "" },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("driver.activeDelivery.dialog.title")}</DialogTitle>
        <DialogDescription className="sr-only">{t("driver.activeDelivery.dialog.description")}</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={form.handleSubmit((data) => {
          toast.success(i18n.t("toasts.reportSent", { category: data.category }));
          onDismiss();
          form.reset();
        })}
        className="space-y-3"
      >
        <div>
          <Label>{t("driver.activeDelivery.dialog.issueType")}</Label>
          <select
            className="mt-1.5 flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            {...form.register("category")}
          >
            {REPORT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`driver.activeDelivery.dialog.categories.${c}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="active-delivery-report-note">{t("driver.activeDelivery.dialog.details")}</Label>
          <Textarea id="active-delivery-report-note" rows={4} className="mt-1.5" {...form.register("note")} />
          {form.formState.errors.note ? (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.note.message}</p>
          ) : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onDismiss}>
            {t("driver.activeDelivery.dialog.cancel")}
          </Button>
          <Button type="submit" className="bg-[#2563eb] hover:bg-[#2563eb]/90">
            {t("driver.activeDelivery.dialog.submit")}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function ActiveDeliveryTab() {
  const { t, i18n } = useTranslation();
  const { delivery, advanceStep, clearDelivery } = useActiveDelivery();
  const [pickupPhoto, setPickupPhoto] = useState<string | null>(null);
  const [podPhoto, setPodPhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  if (!delivery) {
    return (
      <Card className="border-dashed shadow-sm">
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground" aria-hidden />
          <p className="font-medium">{t("driver.activeDelivery.empty.title")}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{t("driver.activeDelivery.empty.description")}</p>
        </CardContent>
      </Card>
    );
  }

  const d = delivery;
  const idx = DELIVERY_STEP_ORDER.findIndex((s) => s === d.currentStep);
  const isRtl = i18n.dir() === "rtl";
  const payoutFormatted = formatAppCurrency(d.earnings, i18n.language);

  function openMapsForStep(step: DeliveryStep) {
    const q = step === "navigate_pickup" ? d.pickupLabel : d.dropLabel;
    window.open(mapsUrl(q), "_blank", "noopener,noreferrer");
  }

  function handlePrimary(step: DeliveryStep) {
    if (step === "picked_up") {
      if (!pickupPhoto) {
        toast.error(i18n.t("toasts.pickupPhotoRequired"));
        return;
      }
      advanceStep();
      return;
    }
    if (step === "delivered") {
      if (!podPhoto || !signature) {
        toast.error(i18n.t("toasts.signaturePhotoRequired"));
        return;
      }
      toast.success(i18n.t("toasts.deliveryCompleted"));
      clearDelivery();
      return;
    }
    advanceStep();
  }

  function onPickupFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setPickupPhoto(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(f);
  }

  function onPodFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setPodPhoto(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(f);
  }

  function onSigFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setSignature(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(f);
  }

  const packageTypeLabel = t(`driver.activeDelivery.packageTypes.${d.packageType}`, {
    defaultValue: d.packageType,
  });

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-primary/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-[#2563eb]/10 to-transparent">
          <CardTitle className="font-mono text-lg">{d.trackingCode}</CardTitle>
          <CardDescription>
            {t("driver.activeDelivery.estimatedPayout", { amount: payoutFormatted })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="overflow-hidden rounded-xl border border-dashed bg-muted/30">
            <div className="flex h-52 items-center justify-center bg-gradient-to-br from-sky-100/60 to-primary/5">
              <div className="text-center text-sm text-muted-foreground">
                <MapPin className="mx-auto mb-2 h-8 w-8 text-primary" aria-hidden />
                {t("driver.activeDelivery.mapPlaceholder.title")}
                <br />
                <span className="text-xs">{t("driver.activeDelivery.mapPlaceholder.hint")}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-3 text-sm">
              <p className="text-xs font-medium text-muted-foreground">{t("driver.activeDelivery.pickup")}</p>
              <p className="mt-1">{d.pickupLabel}</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-sm">
              <p className="text-xs font-medium text-muted-foreground">{t("driver.activeDelivery.dropoff")}</p>
              <p className="mt-1">{d.dropLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" className="min-h-12 flex-1" asChild>
              <a href={`tel:${d.senderPhone}`} aria-label={t("driver.activeDelivery.callSender")}>
                <Phone className="h-4 w-4" aria-hidden />
                {t("driver.activeDelivery.callSender")}
              </a>
            </Button>
            <Button variant="outline" size="lg" className="min-h-12 flex-1" asChild>
              <a href={`sms:${d.senderPhone}`} aria-label={t("driver.activeDelivery.chatSender")}>
                <MessageCircle className="h-4 w-4" aria-hidden />
                {t("driver.activeDelivery.chatSender")}
              </a>
            </Button>
            <Button variant="outline" size="lg" className="min-h-12 flex-1" asChild>
              <a href={`tel:${d.recipientPhone}`} aria-label={t("driver.activeDelivery.callRecipient")}>
                <Phone className="h-4 w-4" aria-hidden />
                {t("driver.activeDelivery.callRecipient")}
              </a>
            </Button>
            <Button variant="outline" size="lg" className="min-h-12 flex-1" asChild>
              <a href={`sms:${d.recipientPhone}`} aria-label={t("driver.activeDelivery.chatRecipient")}>
                <MessageCircle className="h-4 w-4" aria-hidden />
                {t("driver.activeDelivery.chatRecipient")}
              </a>
            </Button>
          </div>

          <Button variant="destructive" className="w-full" onClick={() => setReportOpen(true)}>
            <AlertTriangle className="h-4 w-4" aria-hidden />
            {t("driver.activeDelivery.reportIssue")}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("driver.activeDelivery.stepsTitle")}</CardTitle>
          <CardDescription>{t("driver.activeDelivery.stepsSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DELIVERY_STEP_ORDER.map((stepKey, i) => {
            const done = i < idx;
            const current = i === idx;
            const label = t(`driver.activeDelivery.steps.${stepKey}.label`);
            const action = t(`driver.activeDelivery.steps.${stepKey}.action`);
            return (
              <div
                key={stepKey}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
                  current && "border-[#2563eb]/40 bg-[#2563eb]/5",
                  done && "border-emerald-200 bg-emerald-50/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      done ? "bg-emerald-600 text-white" : current ? "bg-[#2563eb] text-white" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                  </div>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{packageTypeLabel}</p>
                  </div>
                </div>
                {current ? (
                  <div className="flex flex-col gap-2 sm:items-end">
                    {stepKey === "navigate_pickup" || stepKey === "navigate_delivery" ? (
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button
                          size="lg"
                          variant="default"
                          className="min-h-12 bg-[#2563eb] hover:bg-[#2563eb]/90"
                          type="button"
                          onClick={() => openMapsForStep(stepKey)}
                          aria-label={t("driver.activeDelivery.openMapsAria")}
                        >
                          <Navigation className={cn("h-4 w-4", isRtl && "scale-x-[-1]")} aria-hidden />
                          {t("driver.activeDelivery.openMaps")}
                        </Button>
                        <Button
                          size="lg"
                          variant="secondary"
                          className="min-h-12"
                          type="button"
                          onClick={() => advanceStep()}
                          aria-label={t("driver.activeDelivery.arrivedAria")}
                        >
                          {t("driver.activeDelivery.arrived")}
                        </Button>
                      </div>
                    ) : null}
                    {stepKey === "picked_up" ? (
                      <div className="w-full space-y-2 sm:w-auto">
                        <Label className="flex items-center gap-2">
                          <Camera className="h-4 w-4" aria-hidden />
                          {t("driver.activeDelivery.pickupPhotoLabel")}
                        </Label>
                        <Input
                          type="file"
                          accept="image/*"
                          className="min-h-11 cursor-pointer"
                          onChange={onPickupFile}
                        />
                        {pickupPhoto ? (
                          <img
                            src={pickupPhoto}
                            alt={t("driver.activeDelivery.a11y.pickupPhotoPreview")}
                            className="max-h-24 rounded-md border object-cover"
                          />
                        ) : null}
                      </div>
                    ) : null}
                    {stepKey === "delivered" ? (
                      <div className="grid w-full gap-2 sm:max-w-xs">
                        <Label>{t("driver.activeDelivery.podPhotoLabel")}</Label>
                        <Input type="file" accept="image/*" onChange={onPodFile} />
                        {podPhoto ? (
                          <img
                            src={podPhoto}
                            alt={t("driver.activeDelivery.a11y.podPhotoPreview")}
                            className="max-h-24 rounded-md border"
                          />
                        ) : null}
                        <Label className="flex items-center gap-2">
                          <PenLine className="h-4 w-4" aria-hidden />
                          {t("driver.activeDelivery.signatureLabel")}
                        </Label>
                        <Input type="file" accept="image/*" onChange={onSigFile} />
                        {signature ? (
                          <img
                            src={signature}
                            alt={t("driver.activeDelivery.a11y.signaturePreview")}
                            className="max-h-20 rounded-md border"
                          />
                        ) : null}
                      </div>
                    ) : null}
                    {stepKey !== "navigate_pickup" && stepKey !== "navigate_delivery" ? (
                      <Button
                        size="lg"
                        className="min-h-12 w-full bg-[#2563eb] hover:bg-[#2563eb]/90 sm:w-auto"
                        type="button"
                        onClick={() => handlePrimary(stepKey)}
                      >
                        {action}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <ReportIssueForm key={i18n.language} onDismiss={() => setReportOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
