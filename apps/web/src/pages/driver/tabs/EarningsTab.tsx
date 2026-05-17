import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEarnings } from "@/hooks/driver/useEarnings";
import i18n from "@/i18n/config";
import { formatAppCurrency } from "@/lib/format";

export function EarningsTab() {
  const { t, i18n } = useTranslation();
  const { days, transactions, summary, loading } = useEarnings();

  const chartData = days.map((d) => ({
    ...d,
    dayLabel: t(`driver.dashboard.earnings.weekdays.${d.day}`, { defaultValue: d.day }),
  }));

  const payoutDateFormatted = (() => {
    const raw = summary.nextPayoutDate;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    const loc = i18n.language.toLowerCase().startsWith("ar") ? "ar-IQ" : "en-IQ";
    return parsed.toLocaleDateString(loc, { dateStyle: "medium", numberingSystem: "latn" });
  })();

  return (
    <div className="space-y-6">
      <Card className="border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="text-base">{t("driver.dashboard.earnings.weeklyTitle")}</CardTitle>
          <CardDescription>{t("driver.dashboard.earnings.weeklyDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">{t("driver.dashboard.earnings.loadingChart")}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="dayLabel" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} name={t("driver.dashboard.earnings.chartSeriesName")} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("driver.dashboard.earnings.breakdownTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">{t("driver.dashboard.earnings.baseFare")}</span>
              <span className="text-end tabular-nums">{formatAppCurrency(summary.baseFare, i18n.language)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">{t("driver.dashboard.earnings.distanceBonuses")}</span>
              <span className="text-end tabular-nums">{formatAppCurrency(summary.distanceBonus, i18n.language)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">{t("driver.dashboard.earnings.tips")}</span>
              <span className="text-end tabular-nums">{formatAppCurrency(summary.tips, i18n.language)}</span>
            </div>
            <div className="flex justify-between gap-2 border-t pt-2 font-semibold">
              <span>{t("driver.dashboard.earnings.total")}</span>
              <span className="text-end tabular-nums text-[#2563eb]">{formatAppCurrency(summary.weeklyTotal, i18n.language)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("driver.dashboard.earnings.payoutTitle")}</CardTitle>
            <CardDescription>{t("driver.dashboard.earnings.payoutWallet")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">{t("driver.dashboard.earnings.currentBalance")}</p>
              <p className="text-2xl font-bold text-[#2563eb]">{formatAppCurrency(summary.balance, i18n.language)}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("driver.dashboard.earnings.nextPayoutLead")}{" "}
              <strong className="text-foreground">{payoutDateFormatted}</strong>
            </p>
            <Button
              className="w-full min-h-12 bg-[#2563eb] hover:bg-[#2563eb]/90"
              type="button"
              onClick={() => toast.success(i18n.t("toasts.payoutRequestDemo"))}
            >
              {t("driver.dashboard.earnings.requestPayout")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("driver.dashboard.earnings.transactionsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0">
                <div className="min-w-0">
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <span className={tx.type === "credit" ? "font-semibold text-emerald-700" : "text-muted-foreground"}>
                  {tx.type === "credit" ? "+" : "-"}
                  {formatAppCurrency(Math.abs(tx.amount), i18n.language)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
