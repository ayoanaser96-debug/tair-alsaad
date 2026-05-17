import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { PermissionGate } from "@/features/admin/components/PermissionGate";

const UTIL = [
  { hour: "6", pct: 22 },
  { hour: "9", pct: 55 },
  { hour: "12", pct: 78 },
  { hour: "15", pct: 62 },
  { hour: "18", pct: 88 },
  { hour: "21", pct: 45 },
];

const ROUTES = [
  { route: "KL → PJ", count: 420 },
  { route: "PJ → KL", count: 390 },
  { route: "KL → Putrajaya", count: 210 },
];

const CHURN = [
  { month: "Jan", rate: 4.2 },
  { month: "Feb", rate: 3.8 },
  { month: "Mar", rate: 4.5 },
];

export function AdminAnalyticsPage() {
  const { t, i18n } = useTranslation();
  const [range, setRange] = useState("30d");

  const intlLoc = i18n.language.toLowerCase().startsWith("ar") ? "ar-IQ" : "en-IQ";

  const rangeLabel =
    range === "7d" ? t("admin.analytics.range7") : range === "30d" ? t("admin.analytics.range30") : t("admin.analytics.range90");

  const funnelData = useMemo(
    () => [
      { stage: t("admin.analytics.funnelVisit"), value: 10000 },
      { stage: t("admin.analytics.funnelSignup"), value: 3200 },
      { stage: t("admin.analytics.funnelFirstOrder"), value: 1800 },
      { stage: t("admin.analytics.funnelRepeat"), value: 900 },
    ],
    [t, i18n.language],
  );

  const heatData = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5, 6].flatMap((di) => {
        const dayLabel = new Date(2024, 0, 1 + di).toLocaleDateString(intlLoc, { weekday: "short", numberingSystem: "latn" });
        return Array.from({ length: 12 }, (_, hi) => ({
          day: dayLabel,
          hour: `${hi * 2}:00`,
          v: Math.round(20 + Math.sin(di + hi) * 15 + hi * 3),
        }));
      }),
    [intlLoc],
  );

  const churnLocalized = useMemo(
    () =>
      CHURN.map((row, i) => ({
        ...row,
        month: new Date(2024, i, 1).toLocaleDateString(intlLoc, { month: "short", numberingSystem: "latn" }),
      })),
    [intlLoc],
  );

  return (
    <PermissionGate page="analytics">
      <div className="space-y-6">
        <AdminHeader />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("admin.analytics.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("admin.analytics.subtitle", { range: rangeLabel })}</p>
          </div>
          <NativeSelect value={range} onChange={(e) => setRange(e.target.value)} className="w-[160px]">
            <option value="7d">{t("admin.analytics.range7")}</option>
            <option value="30d">{t("admin.analytics.range30")}</option>
            <option value="90d">{t("admin.analytics.range90")}</option>
          </NativeSelect>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">{t("admin.analytics.funnelTitle")}</CardTitle>
              <CardDescription>{t("admin.analytics.funnelDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={88} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">{t("admin.analytics.utilTitle")}</CardTitle>
              <CardDescription>{t("admin.analytics.utilDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={UTIL}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pct" stroke="#2563eb" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-md xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">{t("admin.analytics.heatmapTitle")}</CardTitle>
              <CardDescription>{t("admin.analytics.heatmapDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="grid">
                <TabsList className="mb-3">
                  <TabsTrigger value="grid">{t("admin.analytics.tabGrid")}</TabsTrigger>
                  <TabsTrigger value="area">{t("admin.analytics.tabArea")}</TabsTrigger>
                </TabsList>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={heatData.slice(0, 24)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                      <YAxis hide />
                      <Tooltip />
                      <Area type="monotone" dataKey="v" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">{t("admin.analytics.routesTitle")}</CardTitle>
              <CardDescription>{t("admin.analytics.routesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ROUTES}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="route" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">{t("admin.analytics.churnTitle")}</CardTitle>
              <CardDescription>{t("admin.analytics.churnDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={churnLocalized}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGate>
  );
}
