import { Bell, Navigation } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { useDriverOnline } from "@/hooks/driver/useDriverOnline";

export function DriverSettingsPage() {
  const { t } = useTranslation();
  const { online, setOnline } = useDriverOnline();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("driver.settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("driver.settings.subtitle")}</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Navigation className="h-4 w-4 text-primary" />
            {t("driver.settings.navTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="nav-app">{t("driver.settings.navAppLabel")}</Label>
          <NativeSelect id="nav-app" defaultValue="google" className="max-w-xs">
            <option value="google">{t("driver.settings.mapsGoogle")}</option>
            <option value="waze">{t("driver.settings.mapsWaze")}</option>
            <option value="apple">{t("driver.settings.mapsApple")}</option>
          </NativeSelect>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" />
            {t("driver.settings.notifTitle")}
          </CardTitle>
          <CardDescription>{t("driver.settings.notifDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <span className="text-sm">{t("driver.settings.pushOffers")}</span>
          <Switch defaultChecked aria-label={t("driver.settings.pushOffersAria")} />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("driver.settings.availabilityTitle")}</CardTitle>
          <CardDescription>{t("driver.settings.availabilityDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <span className="text-sm">{t("driver.settings.startOnline")}</span>
          <Switch checked={online} onCheckedChange={setOnline} aria-label={t("driver.settings.startOnlineAria")} />
        </CardContent>
      </Card>
    </div>
  );
}
