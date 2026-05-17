import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { OrderStatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import i18n from "@/i18n/config";
import { formatAdminDateTime, formatAppCurrency } from "@/lib/format";
import { MOCK_HISTORY, type HistoryRow } from "@/pages/driver/driverMock";

function downloadCsv(rows: HistoryRow[]) {
  const header = [
    i18n.t("driver.dashboard.history.csv.date"),
    i18n.t("driver.dashboard.history.csv.trackingId"),
    i18n.t("driver.dashboard.history.csv.route"),
    i18n.t("driver.dashboard.history.csv.earnings"),
    i18n.t("driver.dashboard.history.csv.rating"),
    i18n.t("driver.dashboard.history.csv.status"),
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        new Date(r.date).toISOString(),
        r.trackingCode,
        `"${r.route.replace(/"/g, '""')}"`,
        r.earnings,
        r.ratingReceived ?? "",
        r.status,
      ].join(","),
    ),
  ];
  const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tairalsaad-deliveries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(i18n.t("toasts.csvExported"));
}

export function HistoryTab() {
  const { t, i18n } = useTranslation();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return MOCK_HISTORY.filter((r) => {
      const d = new Date(r.date).getTime();
      if (from && d < new Date(from).getTime()) return false;
      if (to && d > new Date(to).getTime() + 86400000) return false;
      return true;
    });
  }, [from, to]);

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">{t("driver.dashboard.history.title")}</CardTitle>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label htmlFor="driver-history-from" className="text-xs text-muted-foreground">
              {t("driver.dashboard.history.from")}
            </label>
            <Input id="driver-history-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[150px]" />
          </div>
          <div className="space-y-1">
            <label htmlFor="driver-history-to" className="text-xs text-muted-foreground">
              {t("driver.dashboard.history.to")}
            </label>
            <Input id="driver-history-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[150px]" />
          </div>
          <Button variant="outline" className="min-h-11" onClick={() => downloadCsv(filtered)}>
            <Download className="h-4 w-4" />
            {t("driver.dashboard.history.exportCsv")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("driver.dashboard.history.table.date")}</TableHead>
              <TableHead>{t("driver.dashboard.history.table.trackingId")}</TableHead>
              <TableHead>{t("driver.dashboard.history.table.route")}</TableHead>
              <TableHead className="text-end">{t("driver.dashboard.history.table.earnings")}</TableHead>
              <TableHead className="text-center">{t("driver.dashboard.history.table.rating")}</TableHead>
              <TableHead>{t("driver.dashboard.history.table.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatAdminDateTime(r.date, i18n.language)}</TableCell>
                <TableCell className="font-mono text-sm">{r.trackingCode}</TableCell>
                <TableCell className="max-w-[200px] truncate">{r.route}</TableCell>
                <TableCell className="text-end font-medium">{formatAppCurrency(r.earnings, i18n.language)}</TableCell>
                <TableCell className="text-center">{r.ratingReceived ?? "—"}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={r.status} size="sm" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 ? <p className="py-8 text-center text-muted-foreground">{t("driver.dashboard.history.emptyRange")}</p> : null}
      </CardContent>
    </Card>
  );
}
