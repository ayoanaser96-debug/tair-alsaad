import {
  DollarSign,
  Flame,
  Package,
  Star,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { FEATURES } from "@/config/features";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDriverOnline } from "@/hooks/driver/useDriverOnline";
import { formatAppCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useActiveDelivery } from "@/pages/driver/DriverDeliveryContext";
import { DriverVerificationBanner } from "@/pages/driver/DriverVerificationBanner";
import { MOCK_DOCUMENTS } from "@/pages/driver/driverMock";
import { AvailableOrdersTab } from "@/pages/driver/tabs/AvailableOrdersTab";
import { ActiveDeliveryTab } from "@/pages/driver/tabs/ActiveDeliveryTab";
import { EarningsTab } from "@/pages/driver/tabs/EarningsTab";
import { HistoryTab } from "@/pages/driver/tabs/HistoryTab";

const TAB_VALUES = ["available", "active", "history", "earnings"] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTab(s: string | null): s is TabValue {
  return s !== null && TAB_VALUES.includes(s as TabValue);
}

export function DriverDashboardPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab: TabValue = isTab(rawTab) ? rawTab : "available";
  const { online, setOnline } = useDriverOnline();
  const { delivery } = useActiveDelivery();
  const [completedScope, setCompletedScope] = useState<"today" | "week">("today");

  useEffect(() => {
    if (rawTab && !isTab(rawTab)) {
      setSearchParams({ tab: "available" }, { replace: true });
    }
  }, [rawTab, setSearchParams]);

  const setTab = (v: string) => {
    setSearchParams({ tab: v }, { replace: true });
  };

  const stats = useMemo(() => {
    const todayEarnings = 142.5;
    const completedToday = 5;
    const completedWeek = 28;
    const ratingAvg = 4.85;
    const reviewCount = 127;
    return {
      todayEarnings,
      completedToday,
      completedWeek,
      activeOrder: delivery ? 1 : 0,
      ratingAvg,
      reviewCount,
    };
  }, [delivery]);

  const todayEarningsFormatted = formatAppCurrency(stats.todayEarnings, i18n.language);

  return (
    <div className="space-y-6">
      <DriverVerificationBanner documents={MOCK_DOCUMENTS} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
            <span className="flex items-center gap-2">
              <Truck className="h-8 w-8 text-[#2563eb]" />
              {t("driver.dashboard.title")}
            </span>
            <Package className="h-6 w-6 text-muted-foreground" aria-hidden />
          </h1>
          <p className="text-sm text-muted-foreground">{t("driver.dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t("driver.dashboard.online")}</span>
            <Switch checked={online} onCheckedChange={setOnline} aria-label={t("driver.dashboard.onlineAria")} />
          </div>
          <Badge
            className={cn(
              "px-2.5 py-0.5 capitalize",
              online ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-100 text-slate-700",
            )}
          >
            {online ? t("driver.dashboard.receivingOffers") : t("driver.dashboard.offlineBadge")}
          </Badge>
        </div>
      </div>

      {FEATURES.driverStats ? (
      <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("driver.dashboard.stats.todayEarnings")}</CardTitle>
            <DollarSign className="h-4 w-4 text-[#2563eb]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayEarningsFormatted}</p>
            <p className="text-xs text-muted-foreground">{t("driver.dashboard.stats.todayEarningsHint")}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("driver.dashboard.stats.completedDeliveries")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{completedScope === "today" ? stats.completedToday : stats.completedWeek}</p>
              <div className="flex rounded-lg border bg-muted/50 p-0.5 text-xs">
                <button
                  type="button"
                  className={cn(
                    "rounded-md px-2 py-1",
                    completedScope === "today" ? "bg-card shadow-sm" : "text-muted-foreground",
                  )}
                  onClick={() => setCompletedScope("today")}
                >
                  {t("driver.dashboard.stats.scopeToday")}
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-md px-2 py-1",
                    completedScope === "week" ? "bg-card shadow-sm" : "text-muted-foreground",
                  )}
                  onClick={() => setCompletedScope("week")}
                >
                  {t("driver.dashboard.stats.scopeWeek")}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {completedScope === "today" ? t("driver.dashboard.stats.sinceMidnight") : t("driver.dashboard.stats.last7Days")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("driver.dashboard.stats.activeOrder")}</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.activeOrder}</p>
            <p className="text-xs text-muted-foreground">
              {stats.activeOrder ? t("driver.dashboard.stats.inProgress") : t("driver.dashboard.stats.noneNow")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("driver.dashboard.stats.rating")}</CardTitle>
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.ratingAvg.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{t("driver.dashboard.stats.reviewsCount", { count: stats.reviewCount })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/80 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("driver.dashboard.performance.title")}</CardTitle>
            <CardDescription>{t("driver.dashboard.performance.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/40 p-3 text-center">
              <p className="text-2xl font-bold text-[#2563eb]">94%</p>
              <p className="text-xs text-muted-foreground">{t("driver.dashboard.performance.acceptanceRate")}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">98%</p>
              <p className="text-xs text-muted-foreground">{t("driver.dashboard.performance.completionRate")}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">91%</p>
              <p className="text-xs text-muted-foreground">{t("driver.dashboard.performance.onTimeRate")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-dashed border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-orange-500" />
              {t("driver.dashboard.heatMap.title")}
            </CardTitle>
            <CardDescription>{t("driver.dashboard.heatMap.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-28 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100/80 to-[#2563eb]/10 text-center text-xs text-muted-foreground">
              {t("driver.dashboard.heatMap.placeholder")}
            </div>
          </CardContent>
        </Card>
      </div>
      </>
      ) : null}

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid h-auto w-full max-w-4xl grid-cols-2 gap-1 bg-muted/80 p-1 sm:grid-cols-4">
          <TabsTrigger value="available" className="min-h-11 text-sm">
            {t("driver.dashboard.tabs.available")}
          </TabsTrigger>
          <TabsTrigger value="active" className="min-h-11 text-sm">
            {t("driver.dashboard.tabs.active")}
          </TabsTrigger>
          <TabsTrigger value="history" className="min-h-11 text-sm">
            {t("driver.dashboard.tabs.history")}
          </TabsTrigger>
          <TabsTrigger value="earnings" className="min-h-11 text-sm">
            {t("driver.dashboard.tabs.earnings")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="available" className="outline-none">
          <AvailableOrdersTab online={online} />
        </TabsContent>
        <TabsContent value="active" className="outline-none">
          <ActiveDeliveryTab />
        </TabsContent>
        <TabsContent value="history" className="outline-none">
          <HistoryTab />
        </TabsContent>
        <TabsContent value="earnings" className="outline-none">
          <EarningsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
