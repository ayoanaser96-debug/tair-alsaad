import { CreditCard, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { SavedPaymentMethod } from "@/features/orders/schemas";
import {
  useCreatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  usePaymentMethodsQuery,
} from "@/features/orders/hooks";
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
import { useAuth } from "@/context/AuthContext";
import i18n from "@/i18n/config";

export function SenderPaymentsPage() {
  const { auth } = useAuth();
  const { data, isPending: loading } = usePaymentMethodsQuery();
  const createMutation = useCreatePaymentMethodMutation();
  const deleteMutation = useDeletePaymentMethodMutation();

  const methods: SavedPaymentMethod[] = data?.paymentMethods ?? [];

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Personal card");
  const [last4, setLast4] = useState("");
  const [brand, setBrand] = useState("Visa");

  const saving = createMutation.isPending;

  async function save() {
    if (!auth?.accessToken || last4.length !== 4) {
      toast.error(i18n.t("toasts.enterLast4"));
      return;
    }
    try {
      await createMutation.mutateAsync({
        label: label.trim() || "Card",
        last4,
        brand: brand.trim() || "Card",
        isDefault: methods.length === 0,
      });
      setOpen(false);
      setLast4("");
    } catch {
      /* toast in mutation */
    }
  }

  async function remove(id: string) {
    if (!auth?.accessToken) return;
    if (!confirm("Remove this payment method?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      /* toast in mutation */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Payment methods</h1>
          <p className="text-sm text-muted-foreground">Cards used for prepaid deliveries (demo flow).</p>
        </div>
        <Button className="bg-[#2563eb] hover:bg-[#2563eb]/90" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add method
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Saved methods</CardTitle>
          <CardDescription>Manage cards for faster checkout</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : methods.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No payment methods yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {methods.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{m.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {m.brand} ·••• {m.last4}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => void remove(m.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add payment method</DialogTitle>
            <DialogDescription className="sr-only">Enter card label, brand, and last four digits.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="pl">Label</Label>
              <Input id="pl" value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pb">Brand</Label>
              <Input id="pb" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Visa, Mastercard…" />
            </div>
            <div>
              <Label htmlFor="p4">Last 4 digits</Label>
              <Input
                id="p4"
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                maxLength={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2563eb] hover:bg-[#2563eb]/90" disabled={saving || last4.length !== 4} onClick={() => void save()}>
              {saving ? <Loader2 className="animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
