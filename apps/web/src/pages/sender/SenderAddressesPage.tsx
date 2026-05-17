import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getCities, type City } from "@/api";
import type { SavedAddress } from "@/features/orders/schemas";
import {
  useCreateSavedAddressMutation,
  useDeleteSavedAddressMutation,
  useSavedAddressesQuery,
  useUpdateSavedAddressMutation,
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
import { NativeSelect } from "@/components/ui/native-select";
import { useAuth } from "@/context/AuthContext";
import i18n from "@/i18n/config";

export function SenderAddressesPage() {
  const { auth } = useAuth();
  const { data, isPending: loading } = useSavedAddressesQuery();
  const createMutation = useCreateSavedAddressMutation();
  const updateMutation = useUpdateSavedAddressMutation();
  const deleteMutation = useDeleteSavedAddressMutation();

  const list = data?.addresses ?? [];

  const [cities, setCities] = useState<City[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [cityId, setCityId] = useState("");
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");

  const saving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    void getCities().then(setCities).catch(() => setCities([]));
  }, []);

  function openNew() {
    setEditing(null);
    setLabel("");
    setLine1("");
    setCityId("");
    setPhone("");
    setContactName("");
    setDialogOpen(true);
  }

  function openEdit(a: SavedAddress) {
    setEditing(a);
    setLabel(a.label);
    setLine1(a.line1);
    setCityId(a.cityId ?? "");
    setPhone(a.phone ?? "");
    setContactName(a.contactName ?? "");
    setDialogOpen(true);
  }

  async function save() {
    if (!auth?.accessToken || !label.trim() || !line1.trim()) {
      toast.error(i18n.t("toasts.labelAddressRequired"));
      return;
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          body: {
            label: label.trim(),
            line1: line1.trim(),
            cityId: cityId || null,
            phone: phone || null,
            contactName: contactName || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          label: label.trim(),
          line1: line1.trim(),
          cityId: cityId || null,
          phone: phone || null,
          contactName: contactName || null,
        });
      }
      setDialogOpen(false);
    } catch {
      /* toast in mutation */
    }
  }

  async function remove(id: string) {
    if (!auth?.accessToken) return;
    if (!confirm("Delete this address?")) return;
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
          <h1 className="text-2xl font-semibold">Saved addresses</h1>
          <p className="text-sm text-muted-foreground">Reuse pickup and delivery locations when creating orders.</p>
        </div>
        <Button className="bg-[#2563eb] hover:bg-[#2563eb]/90" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add address
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Address book</CardTitle>
          <CardDescription>Manage your saved locations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : list.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No saved addresses yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {list.map((a) => (
                <li key={a.id} className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{a.label}</p>
                    <p className="text-sm text-muted-foreground">{a.line1}</p>
                    {a.city ? (
                      <p className="text-xs text-muted-foreground">
                        {a.city.name}, {a.city.country}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(a)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => void remove(a.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit address" : "New address"}</DialogTitle>
            <DialogDescription className="sr-only">
              {editing ? "Update saved address details." : "Add a new saved address entry."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="lbl">Label</Label>
              <Input id="lbl" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home, Office…" />
            </div>
            <div>
              <Label htmlFor="line1">Address line</Label>
              <Input id="line1" value={line1} onChange={(e) => setLine1(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="city">City (optional)</Label>
              <NativeSelect id="city" value={cityId} onChange={(e) => setCityId(e.target.value)}>
                <option value="">—</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.country}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label htmlFor="contact">Contact name</Label>
              <Input id="contact" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ph">Phone</Label>
              <Input id="ph" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2563eb] hover:bg-[#2563eb]/90" disabled={saving} onClick={() => void save()}>
              {saving ? <Loader2 className="animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
