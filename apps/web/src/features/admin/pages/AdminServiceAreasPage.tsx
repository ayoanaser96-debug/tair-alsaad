import { MapPin, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { PermissionGate } from "@/features/admin/components/PermissionGate";
import { createCity, getCities } from "@/lib/api/cities";

const ZONES = [
  { id: "z1", name: "Kuala Lumpur core", base: 5, perKm: 2.2, surge: 1, hours: "06:00–23:00" },
  { id: "z2", name: "Petaling Jaya", base: 4.5, perKm: 2.0, surge: 1.1, hours: "24/7" },
];

const CITIES_QK = ["cities", "admin"] as const;

export function AdminServiceAreasPage() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [zones, setZones] = useState(ZONES);
  const [newName, setNewName] = useState("");
  const [newCountry, setNewCountry] = useState("");

  const {
    data: cities = [],
    isPending: citiesLoading,
    isError: citiesError,
    refetch,
  } = useQuery({
    queryKey: CITIES_QK,
    queryFn: getCities,
  });

  useEffect(() => {
    if (citiesError) toast.error(t("toasts.citiesLoadError"));
  }, [citiesError, t]);

  const createMutation = useMutation({
    mutationFn: createCity,
    onSuccess: async () => {
      toast.success(t("toasts.cityAdded"));
      setNewName("");
      await qc.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: () => toast.error(t("toasts.cityCreateError")),
  });

  return (
    <PermissionGate page="serviceAreas">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.serviceAreas.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.serviceAreas.subtitle")}</p>
        </div>

        <Card className="overflow-hidden border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-primary" />
              {t("admin.serviceAreas.citiesTitle")}
            </CardTitle>
            <CardDescription>{t("admin.serviceAreas.citiesDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[10rem] flex-1 space-y-2">
                <Label htmlFor="city-name">{t("admin.serviceAreas.cityName")}</Label>
                <Input
                  id="city-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t("admin.serviceAreas.cityPlaceholder")}
                />
              </div>
              <div className="min-w-[8rem] space-y-2">
                <Label htmlFor="city-country">{t("admin.serviceAreas.country")}</Label>
                <Input
                  id="city-country"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  placeholder={t("admin.serviceAreas.countryPlaceholder")}
                />
              </div>
              <Button
                type="button"
                disabled={createMutation.isPending || !newName.trim() || !newCountry.trim()}
                onClick={() => createMutation.mutate({ name: newName, country: newCountry })}
              >
                <Plus className="me-1 h-4 w-4" />
                {t("admin.serviceAreas.addCity")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => void refetch()}
                title={t("admin.serviceAreas.refreshTitle")}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {citiesLoading ? (
              <p className="text-sm text-muted-foreground">{t("admin.serviceAreas.loading")}</p>
            ) : (
              <ul className="max-h-56 divide-y overflow-y-auto rounded-md border text-sm">
                {cities.length === 0 ? (
                  <li className="px-3 py-6 text-center text-muted-foreground">{t("admin.serviceAreas.emptyCities")}</li>
                ) : (
                  cities.map((c) => (
                    <li key={c.id} className="flex justify-between gap-2 px-3 py-2">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">{c.country}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-primary" />
              {t("admin.serviceAreas.coverageTitle")}
            </CardTitle>
            <CardDescription>{t("admin.serviceAreas.coverageDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex aspect-[21/9] min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 text-sm text-muted-foreground">
              {t("admin.serviceAreas.mapPlaceholder")}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {zones.map((z) => (
            <Card key={z.id} className="border-border/80 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{z.name}</CardTitle>
                <CardDescription>{t("admin.serviceAreas.zoneEconomics")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>{t("admin.serviceAreas.baseFare")}</Label>
                    <Input
                      type="number"
                      defaultValue={z.base}
                      onBlur={(e) =>
                        setZones((prev) =>
                          prev.map((x) => (x.id === z.id ? { ...x, base: Number(e.target.value) || 0 } : x)),
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>{t("admin.serviceAreas.perKm")}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      defaultValue={z.perKm}
                      onBlur={(e) =>
                        setZones((prev) =>
                          prev.map((x) => (x.id === z.id ? { ...x, perKm: Number(e.target.value) || 0 } : x)),
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>{t("admin.serviceAreas.surgeMultiplier")}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      defaultValue={z.surge}
                      onBlur={(e) =>
                        setZones((prev) =>
                          prev.map((x) => (x.id === z.id ? { ...x, surge: Number(e.target.value) || 1 } : x)),
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>{t("admin.serviceAreas.hours")}</Label>
                    <NativeSelect defaultValue={z.hours.includes("24") ? "24" : "custom"}>
                      <option value="24">{t("admin.serviceAreas.hours247")}</option>
                      <option value="custom">{t("admin.serviceAreas.hoursCustom")}</option>
                    </NativeSelect>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => toast.success(i18n.t("toasts.zoneSavedDemo", { name: z.name }))}
                >
                  {t("admin.serviceAreas.saveZone")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PermissionGate>
  );
}
