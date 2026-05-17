import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_REVIEWS } from "@/pages/driver/driverMock";

function formatReviewDate(raw: string, lang: string): string {
  const parsed = new Date(raw.includes("T") ? raw : `${raw}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return raw;
  const loc = lang.toLowerCase().startsWith("ar") ? "ar-IQ" : "en-IQ";
  return parsed.toLocaleDateString(loc, { dateStyle: "medium", numberingSystem: "latn" });
}

export function DriverRatingsPage() {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("driver.ratings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("driver.ratings.subtitle")}</p>
      </div>

      <div className="space-y-4">
        {MOCK_REVIEWS.map((r) => (
          <Card key={r.id} className="shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{r.senderName}</CardTitle>
                <div className="flex items-center gap-0.5 text-amber-500" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-current" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
              <CardDescription>
                {t("driver.ratings.trackingDate", { code: r.trackingCode, date: formatReviewDate(r.date, i18n.language) })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{r.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
