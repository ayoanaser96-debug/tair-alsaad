import {
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Shield,
  Star,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { normalizeOrderStatus, orderStatusLabel } from "@/components/shared";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import { cn, formatAdminDateTime, formatAppCurrency } from "@/lib/utils";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"];

function Trend({ value }: { value: number }) {
  const { t } = useTranslation();
  const up = value >= 0;
  const v = Math.abs(value);
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs", up ? "text-emerald-600" : "text-red-600")}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? t("admin.overview.trendUp", { value: v }) : t("admin.overview.trendDown", { value: v })}
    </span>
  );
}

export function AdminOverviewPage() {
  const { t, i18n } = useTranslation();
  const { stats, loading, error, kpi, ordersSeriesDaily, statusDistribution, revenueByCity, activity } = useAdminDashboard();
  const [seriesMode, setSeriesMode] = useState<"daily" | "weekly" | "monthly">("daily");

  const intlLoc = i18n.language.toLowerCase().startsWith("ar") ? "ar-IQ" : "en-IQ";

  const localizedDaily = useMemo(
    () =>
      ordersSeriesDaily.map((d, i) => ({
        ...d,
        label: new Date(2024, 0, 1 + i).toLocaleDateString(intlLoc, { weekday: "short", numberingSystem: "latn" }),
      })),
    [ordersSeriesDaily, intlLoc],
  );

  const lineData = useMemo(() => {
    if (seriesMode === "daily") return localizedDaily;
    if (seriesMode === "weekly")
      return [
        { label: "W1", orders: 1200 },
        { label: "W2", orders: 1350 },
        { label: "W3", orders: 1180 },
        { label: "W4", orders: 1420 },
      ];
    return [
      { label: new Date(2024, 0, 1).toLocaleDateString(intlLoc, { month: "short", numberingSystem: "latn" }), orders: 4800 },
      { label: new Date(2024, 1, 1).toLocaleDateString(intlLoc, { month: "short", numberingSystem: "latn" }), orders: 5100 },
      { label: new Date(2024, 2, 1).toLocaleDateString(intlLoc, { month: "short", numberingSystem: "latn" }), orders: 4950 },
    ];
  }, [seriesMode, localizedDaily, intlLoc]);

  const pieData = useMemo(
    () =>
      statusDistribution.map((d) => ({
        ...d,
        name: orderStatusLabel(normalizeOrderStatus(d.name)),
      })),
    [statusDistribution, i18n.language],
  );

  return (
    <div className="space-y-6">
      <AdminHeader />

      <div>
        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
          <Shield className="h-8 w-8 text-[#2563eb]" />
          {t("admin.overview.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("admin.overview.subtitle")}</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading && !stats ? <p className="text-sm text-muted-foreground">{t("admin.overview.loadingKpis")}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Card className="border-border/80 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">{t("admin.overview.sendersTitle")}</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpi.senders.toLocaleString(intlLoc, { numberingSystem: "latn" })}</p>
            <p className="text-xs text-muted-foreground">{t("admin.overview.sendersHint")}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">{t("admin.overview.driversTitle")}</CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {kpi.driversOnline}{" "}
              <span className="text-base font-normal text-muted-foreground">/ {kpi.driversTotal}</span>
            </p>
            <p className="text-xs text-muted-foreground">{t("admin.overview.driversHint")}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">{t("admin.overview.ordersToday")}</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpi.ordersToday}</p>
            <Trend value={kpi.ordersYesterdayPct} />
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">{t("admin.overview.revenueToday")}</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatAppCurrency(kpi.revenueToday, i18n.language)}</p>
            <Trend value={kpi.revenueYesterdayPct} />
          </CardContent>
        </Card>
        <Card
          className={cn(
            "border-border/80 shadow-md",
            kpi.pendingDisputes > 0 && "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20",
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">{t("admin.overview.pendingDisputes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("text-2xl font-bold", kpi.pendingDisputes > 0 && "text-red-700 dark:text-red-400")}>
              {kpi.pendingDisputes}
            </p>
            <p className="text-xs text-muted-foreground">{t("admin.overview.openCases")}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">{t("admin.overview.platformRating")}</CardTitle>
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpi.platformRating.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{t("admin.overview.avgReviews")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/80 shadow-md xl:col-span-1">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">{t("admin.overview.ordersOverTime")}</CardTitle>
              <CardDescription>{t("admin.overview.volumeTrend")}</CardDescription>
            </div>
            <Tabs value={seriesMode} onValueChange={(v) => setSeriesMode(v as typeof seriesMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="daily" className="px-2 text-xs">
                  {t("admin.overview.tabDay")}
                </TabsTrigger>
                <TabsTrigger value="weekly" className="px-2 text-xs">
                  {t("admin.overview.tabWeek")}
                </TabsTrigger>
                <TabsTrigger value="monthly" className="px-2 text-xs">
                  {t("admin.overview.tabMonth")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8 }} />
                <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">{t("admin.overview.orderStatus")}</CardTitle>
            <CardDescription>{t("admin.overview.distribution")}</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">{t("admin.overview.revenueByCity")}</CardTitle>
            <CardDescription>{t("admin.overview.revenueMock")}</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByCity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number" ? formatAppCurrency(value, i18n.language) : String(value ?? "")
                  }
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="text-base">{t("admin.overview.recentActivity")}</CardTitle>
          <CardDescription>{t("admin.overview.activityFeed")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {activity.map((a) => (
              <li key={a.id} className="flex flex-wrap items-start justify-between gap-2 py-3 first:pt-0">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.detail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{t(`admin.overview.activityKind.${a.kind}` as const)}</Badge>
                  <span className="text-xs text-muted-foreground">{formatAdminDateTime(a.at, i18n.language)}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {stats?.ordersByStatus ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("admin.overview.rawStats")}</CardTitle>
            <CardDescription>{t("admin.overview.fromStatsApi")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(stats.ordersByStatus).map(([k, v]) => (
              <Badge key={k} variant="outline">
                {orderStatusLabel(normalizeOrderStatus(k))}: {v}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
