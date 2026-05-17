import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, Package, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getCities, type City } from "@/api";
import { useCreateOrderMutation, useEstimateOrderMutation } from "@/features/orders/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import i18n from "@/i18n/config";
import { cn } from "@/lib/utils";

const categoryToPackage = {
  documents: "DOCUMENT",
  electronics: "MEDIUM",
  fragile: "SMALL",
  clothing: "SMALL",
  other: "LARGE",
} as const;

const formSchema = z
  .object({
    description: z.string().min(1, "Description is required").max(2000),
    weightKg: z.coerce.number().min(0.01, "Min 0.01 kg").max(500),
    dimL: z.string().optional(),
    dimW: z.string().optional(),
    dimH: z.string().optional(),
    category: z.enum(["documents", "electronics", "fragile", "clothing", "other"]),
    declaredValue: z.coerce.number().min(0),
    pickupAddress: z.string().min(1, "Pickup address required").max(500),
    dropAddress: z.string().min(1, "Delivery address required").max(500),
    receiverName: z.string().min(1).max(200),
    receiverPhone: z.string().min(5).max(32),
    cityId: z.string().min(1, "Select destination city"),
    deliveryWindow: z.enum(["SAME_DAY", "NEXT_DAY", "SCHEDULED"]),
    scheduledAt: z.string().optional(),
    paymentMethod: z.enum(["PREPAID", "CASH_ON_DELIVERY"]),
    acceptTerms: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryWindow === "SCHEDULED" && (!data.scheduledAt || !String(data.scheduledAt).trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Schedule date required", path: ["scheduledAt"] });
    }
  });

export type CreateOrderFormValues = z.infer<typeof formSchema>;

const STEP1: (keyof CreateOrderFormValues)[] = [
  "description",
  "weightKg",
  "dimL",
  "dimW",
  "dimH",
  "category",
  "declaredValue",
];
const STEP2: (keyof CreateOrderFormValues)[] = [
  "pickupAddress",
  "dropAddress",
  "receiverName",
  "receiverPhone",
  "cityId",
  "deliveryWindow",
  "scheduledAt",
];

type Props = {
  onSuccess?: () => void;
  onClose?: () => void;
  variant?: "modal" | "page";
};

export function CreateOrderForm({ onSuccess, onClose, variant = "modal" }: Props) {
  const { auth } = useAuth();
  const estimateMutation = useEstimateOrderMutation();
  const createMutation = useCreateOrderMutation();
  const [step, setStep] = useState(1);
  const [cities, setCities] = useState<City[]>([]);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<{ total: number; breakdown: { label: string; amount: number }[] } | null>(
    null,
  );
  const estimating = estimateMutation.isPending;
  const submitting = createMutation.isPending;

  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      weightKg: 1,
      dimL: "",
      dimW: "",
      dimH: "",
      category: "other",
      declaredValue: 0,
      pickupAddress: "",
      dropAddress: "",
      receiverName: "",
      receiverPhone: "",
      cityId: "",
      deliveryWindow: "NEXT_DAY",
      scheduledAt: "",
      paymentMethod: "PREPAID",
      acceptTerms: false,
    },
  });

  const { watch, setValue, register, formState: { errors }, trigger } = form;

  useEffect(() => {
    void getCities().then(setCities).catch(() => setCities([]));
  }, []);

  useEffect(() => {
    if (auth?.user.cityId && cities.some((c) => c.id === auth.user.cityId)) {
      setValue("cityId", auth.user.cityId);
    }
  }, [auth?.user.cityId, cities, setValue]);

  const category = watch("category");
  const weightKg = watch("weightKg");
  const declaredValue = watch("declaredValue");
  const deliveryWindow = watch("deliveryWindow");

  const packageType = categoryToPackage[category];

  const runEstimate = useCallback(async () => {
    if (!auth?.accessToken) return;
    try {
      const e = await estimateMutation.mutateAsync({
        packageType,
        weightKg,
        declaredValue,
        deliveryWindow,
      });
      setEstimate(e);
    } catch {
      setEstimate(null);
    }
  }, [auth?.accessToken, packageType, weightKg, declaredValue, deliveryWindow, estimateMutation]);

  useEffect(() => {
    const t = setTimeout(() => {
      void runEstimate();
    }, 450);
    return () => clearTimeout(t);
  }, [runEstimate]);

  async function goNext() {
    if (step === 1) {
      const ok = await trigger(STEP1);
      if (ok) setStep(2);
      return;
    }
    if (step === 2) {
      const ok = await trigger(STEP2);
      if (ok) setStep(3);
    }
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setPhotoDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  }

  function buildExtras(): Record<string, unknown> {
    const v = form.getValues();
    const extras: Record<string, unknown> = {
      description: v.description,
      weightKg: v.weightKg,
      categoryLabel: v.category,
      declaredValue: v.declaredValue,
    };
    const l = parseFloat(String(v.dimL ?? "").trim());
    const w = parseFloat(String(v.dimW ?? "").trim());
    const h = parseFloat(String(v.dimH ?? "").trim());
    if (Number.isFinite(l) && Number.isFinite(w) && Number.isFinite(h)) {
      extras.dimensionsCm = { l, w, h };
    }
    if (photoDataUrl) extras.pickupPhotoDataUrl = photoDataUrl;
    return extras;
  }

  async function submitDraft() {
    const ok = await trigger();
    if (!ok) {
      toast.error(i18n.t("toasts.fixValidation"));
      return;
    }
    if (!auth?.accessToken) return;
    try {
      const v = form.getValues();
      await createMutation.mutateAsync({
        cityId: v.cityId,
        receiverName: v.receiverName,
        receiverPhone: v.receiverPhone,
        pickupAddress: v.pickupAddress,
        dropAddress: v.dropAddress,
        packageType: categoryToPackage[v.category],
        paymentMethod: v.paymentMethod,
        notes: v.description.slice(0, 2000),
        extras: buildExtras(),
        deliveryWindow: v.deliveryWindow,
        scheduledAt: v.deliveryWindow === "SCHEDULED" ? v.scheduledAt : null,
        submit: false,
      });
      toast.success(i18n.t("toasts.draftSaved"));
      onSuccess?.();
      onClose?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : i18n.t("toasts.requestFailed"));
    }
  }

  async function submitFinal() {
    const ok = await trigger();
    if (!ok) {
      toast.error(i18n.t("toasts.acceptTermsFix"));
      return;
    }
    if (!form.getValues("acceptTerms")) {
      toast.error(i18n.t("toasts.acceptTermsPlace"));
      return;
    }
    if (!auth?.accessToken) return;
    try {
      const v = form.getValues();
      await createMutation.mutateAsync({
        cityId: v.cityId,
        receiverName: v.receiverName,
        receiverPhone: v.receiverPhone,
        pickupAddress: v.pickupAddress,
        dropAddress: v.dropAddress,
        packageType: categoryToPackage[v.category],
        paymentMethod: v.paymentMethod,
        notes: v.description.slice(0, 2000),
        extras: buildExtras(),
        deliveryWindow: v.deliveryWindow,
        scheduledAt: v.deliveryWindow === "SCHEDULED" ? v.scheduledAt : null,
        submit: true,
      });
      toast.success(i18n.t("toasts.orderPlacedSuccess"));
      onSuccess?.();
      onClose?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : i18n.t("toasts.requestFailed"));
    }
  }

  return (
    <div className={cn("space-y-6", variant === "page" && "max-w-3xl")}>
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {s}
            </div>
            {s < 3 ? <div className={cn("h-0.5 w-8", step > s ? "bg-primary" : "bg-muted")} /> : null}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">Step {step} of 3</p>

      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Package description</Label>
            <Textarea id="description" className="mt-1.5" rows={3} {...register("description")} />
            {errors.description ? <p className="mt-1 text-xs text-destructive">{errors.description.message}</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input id="weightKg" type="number" step="0.01" className="mt-1.5" {...register("weightKg")} />
              {errors.weightKg ? <p className="mt-1 text-xs text-destructive">{errors.weightKg.message}</p> : null}
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <NativeSelect id="category" className="mt-1.5" {...register("category")}>
                <option value="documents">Documents</option>
                <option value="electronics">Electronics</option>
                <option value="fragile">Fragile</option>
                <option value="clothing">Clothing</option>
                <option value="other">Other</option>
              </NativeSelect>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>L (cm)</Label>
              <Input type="text" inputMode="decimal" className="mt-1.5" placeholder="Optional" {...register("dimL")} />
            </div>
            <div>
              <Label>W (cm)</Label>
              <Input type="text" inputMode="decimal" className="mt-1.5" placeholder="Optional" {...register("dimW")} />
            </div>
            <div>
              <Label>H (cm)</Label>
              <Input type="text" inputMode="decimal" className="mt-1.5" placeholder="Optional" {...register("dimH")} />
            </div>
          </div>
          <div>
            <Label htmlFor="declaredValue">Declared value (local)</Label>
            <Input id="declaredValue" type="number" step="0.01" className="mt-1.5" {...register("declaredValue")} />
          </div>
          <div>
            <Label>Package photo (optional)</Label>
            <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8">
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
            </label>
            {photoDataUrl ? (
              <img src={photoDataUrl} alt="" className="mt-2 max-h-32 rounded-md border object-contain" />
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="pickupAddress">Pickup address</Label>
            <Textarea id="pickupAddress" className="mt-1.5" rows={2} {...register("pickupAddress")} />
            {errors.pickupAddress ? <p className="mt-1 text-xs text-destructive">{errors.pickupAddress.message}</p> : null}
          </div>
          <Card className="overflow-hidden border-dashed bg-muted/30">
            <CardContent className="flex h-36 items-center justify-center gap-2 p-4 text-muted-foreground">
              <MapPin className="h-6 w-6" />
              <span className="text-sm">Map preview (placeholder)</span>
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="receiverName">Recipient name</Label>
              <Input id="receiverName" className="mt-1.5" {...register("receiverName")} />
              {errors.receiverName ? <p className="mt-1 text-xs text-destructive">{errors.receiverName.message}</p> : null}
            </div>
            <div>
              <Label htmlFor="receiverPhone">Recipient phone</Label>
              <Input id="receiverPhone" className="mt-1.5" {...register("receiverPhone")} />
              {errors.receiverPhone ? <p className="mt-1 text-xs text-destructive">{errors.receiverPhone.message}</p> : null}
            </div>
          </div>
          <div>
            <Label htmlFor="dropAddress">Delivery address</Label>
            <Textarea id="dropAddress" className="mt-1.5" rows={2} {...register("dropAddress")} />
            {errors.dropAddress ? <p className="mt-1 text-xs text-destructive">{errors.dropAddress.message}</p> : null}
          </div>
          <div>
            <Label htmlFor="cityId">Destination city</Label>
            <NativeSelect id="cityId" className="mt-1.5" {...register("cityId")}>
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country}
                </option>
              ))}
            </NativeSelect>
            {errors.cityId ? <p className="mt-1 text-xs text-destructive">{errors.cityId.message}</p> : null}
          </div>
          <div>
            <Label htmlFor="deliveryWindow">Delivery window</Label>
            <NativeSelect id="deliveryWindow" className="mt-1.5" {...register("deliveryWindow")}>
              <option value="SAME_DAY">Same day</option>
              <option value="NEXT_DAY">Next day</option>
              <option value="SCHEDULED">Scheduled</option>
            </NativeSelect>
          </div>
          {deliveryWindow === "SCHEDULED" ? (
            <div>
              <Label htmlFor="scheduledAt">Scheduled time</Label>
              <Input id="scheduledAt" type="datetime-local" className="mt-1.5" {...register("scheduledAt")} />
              {errors.scheduledAt ? <p className="mt-1 text-xs text-destructive">{errors.scheduledAt.message}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <Card className="border-primary/20 shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2 font-medium">
                <Package className="h-4 w-4 text-primary" />
                Live estimate
                {estimating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              </div>
              {estimate ? (
                <ul className="space-y-1 text-sm">
                  {estimate.breakdown.map((row) => (
                    <li key={row.label} className="flex justify-between">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span>{row.amount.toFixed(2)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{estimate.total.toFixed(2)}</span>
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Enter package details to see pricing.</p>
              )}
            </CardContent>
          </Card>
          <div>
            <Label htmlFor="paymentMethod">Payment method</Label>
            <NativeSelect id="paymentMethod" className="mt-1.5" {...register("paymentMethod")}>
              <option value="PREPAID">Prepaid (wallet / card)</option>
              <option value="CASH_ON_DELIVERY">Cash on delivery</option>
            </NativeSelect>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-input" {...register("acceptTerms")} />
            <span>I agree to Tair Al Saad (طير السعد) / smartgateapp.com terms, liability limits, and pricing for this shipment.</span>
          </label>
          {errors.acceptTerms ? <p className="text-xs text-destructive">{String(errors.acceptTerms.message)}</p> : null}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
        <div className="flex gap-2">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {step < 3 ? (
            <Button type="button" className="bg-[#2563eb] hover:bg-[#2563eb]/90" onClick={() => void goNext()}>
              Next
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" disabled={submitting} onClick={() => void submitDraft()}>
                {submitting ? <Loader2 className="animate-spin" /> : null}
                Save draft
              </Button>
              <Button type="button" className="bg-[#2563eb] hover:bg-[#2563eb]/90" disabled={submitting} onClick={() => void submitFinal()}>
                {submitting ? <Loader2 className="animate-spin" /> : null}
                Place order
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
