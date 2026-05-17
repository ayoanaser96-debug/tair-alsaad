import type { ColumnDef } from "@tanstack/react-table";
import { Banknote, PiggyBank, RefreshCw, TrendingUp, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { DataTable } from "@/components/shared";
import { PermissionGate } from "@/features/admin/components/PermissionGate";
import { usePayments, type AdminPaymentRow } from "@/features/admin/hooks/usePayments";
import { formatAdminDateTime, formatAppCurrency } from "@/lib/utils";

export function AdminPaymentsPage() {
  const { t, i18n } = useTranslation();
  const { summary, transactions, refetch } = usePayments();

  const columns = useMemo<ColumnDef<AdminPaymentRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: t("admin.payments.columns.date"),
        id: "date",
        cell: ({ row }) => {
          const d = row.original.date;
          const iso = d.includes("T") ? d : `${d}T12:00:00`;
          return formatAdminDateTime(iso, i18n.language);
        },
      },
      { accessorKey: "type", header: t("admin.payments.columns.type"), id: "type" },
      {
        accessorKey: "amount",
        header: t("admin.payments.columns.amount"),
        id: "amount",
        cell: ({ row }) => (
          <span className={row.original.amount < 0 ? "text-red-600 dark:text-red-400" : ""}>
            {row.original.amount >= 0 ? "+" : ""}
            {formatAppCurrency(row.original.amount, i18n.language)}
          </span>
        ),
      },
      { accessorKey: "party", header: t("admin.payments.columns.party"), id: "party" },
      { accessorKey: "status", header: t("admin.payments.columns.status"), id: "status" },
    ],
    [t, i18n.language],
  );

  return (
    <PermissionGate page="payments">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.payments.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.payments.subtitle")}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/80 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                {t("admin.payments.totalRevenue")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatAppCurrency(summary.totalRevenue, i18n.language)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <PiggyBank className="h-4 w-4 text-primary" />
                {t("admin.payments.platformCommission")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatAppCurrency(summary.platformCommission, i18n.language)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Wallet className="h-4 w-4 text-primary" />
                {t("admin.payments.driverPayoutsOwed")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatAppCurrency(summary.driverPayoutsOwed, i18n.language)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Banknote className="h-4 w-4 text-primary" />
                {t("admin.payments.refundsIssued")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatAppCurrency(summary.refundsIssued, i18n.language)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="gap-2" onClick={() => void refetch()}>
              <RefreshCw className="h-4 w-4" />
              {t("admin.payments.refresh")}
            </Button>
            <Button type="button" onClick={() => toast.success(i18n.t("toasts.bulkPayoutDemo"))}>
              {t("admin.payments.processPayouts")}
            </Button>
            <Button type="button" variant="secondary" onClick={() => toast.success(i18n.t("toasts.refundPanelDemo"))}>
              {t("admin.payments.refundsPanel")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <NativeSelect className="w-[140px]" defaultValue="daily">
              <option value="daily">{t("admin.payments.reportDaily")}</option>
              <option value="weekly">{t("admin.payments.reportWeekly")}</option>
              <option value="monthly">{t("admin.payments.reportMonthly")}</option>
            </NativeSelect>
            <Button type="button" variant="outline" onClick={() => toast.success(i18n.t("toasts.exportStartedDemo"))}>
              {t("admin.payments.exportFinancials")}
            </Button>
          </div>
        </div>

        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">{t("admin.payments.transactionsTitle")}</CardTitle>
            <CardDescription>{t("admin.payments.transactionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={transactions} pageSize={10} />
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
