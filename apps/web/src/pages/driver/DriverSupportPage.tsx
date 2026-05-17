import { Headphones, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DriverSupportPage() {
  const { t } = useTranslation();
  const email = "drivers@smartgateapp.com";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("driver.support.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("driver.support.subtitle")}</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Headphones className="h-4 w-4 text-primary" />
            {t("driver.support.lineTitle")}
          </CardTitle>
          <CardDescription>{t("driver.support.lineHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">{t("driver.support.body")}</p>
          <a
            href={`mailto:${email}`}
            className="inline-flex flex-wrap items-center gap-2 text-[#2563eb] hover:underline"
            aria-label={`${t("driver.support.emailSupport")}: ${email}`}
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span>{email}</span>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
