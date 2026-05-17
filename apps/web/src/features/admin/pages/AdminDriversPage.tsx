import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, FileText, MoreHorizontal, Truck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog";
import { DataTable } from "@/components/shared";
import { DriverStatusBadge } from "@/features/admin/components/DriverStatusBadge";
import { PermissionGate } from "@/features/admin/components/PermissionGate";
import { createDriverRejectSchema, type DriverRejectFormValues } from "@/features/admin/formSchemas";
import { useDrivers, type AdminDriverRow } from "@/features/admin/hooks/useDrivers";
import { MOCK_DRIVER_DOCS, type MockDriverDocKey } from "@/features/admin/mock/data";
import { cn, formatAdminDateTime, formatAppCurrency } from "@/lib/utils";

const DOC_KEYS = Object.keys(MOCK_DRIVER_DOCS) as MockDriverDocKey[];

function VerificationBadge({ v }: { v: AdminDriverRow["verification"] }) {
  const { t } = useTranslation();
  const cls =
    v === "verified"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : v === "pending"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-red-200 bg-red-50 text-red-800";
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", cls)}>
      {t(`admin.drivers.verificationState.${v}`)}
    </span>
  );
}

function DriverRejectModal({
  driverName,
  onDismiss,
  onSubmit,
}: {
  driverName: string;
  onDismiss: () => void;
  onSubmit: (data: DriverRejectFormValues) => void;
}) {
  const { t, i18n } = useTranslation();
  const schema = useMemo(() => createDriverRejectSchema(t), [t, i18n.language]);
  const form = useForm<DriverRejectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg"
        onSubmit={form.handleSubmit((data) => {
          onSubmit(data);
          form.reset();
        })}
      >
        <h3 className="text-lg font-semibold">{t("admin.drivers.rejectTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{driverName}</p>
        <textarea
          className="mt-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
          placeholder={t("admin.drivers.rejectReasonPlaceholder")}
          {...form.register("reason")}
        />
        {form.formState.errors.reason ? (
          <p className="mt-1 text-xs text-destructive">{form.formState.errors.reason.message}</p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onDismiss}>
            {t("admin.drivers.cancel")}
          </Button>
          <Button type="submit" variant="destructive">
            {t("admin.drivers.submitRejection")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function AdminDriversPage() {
  const { t, i18n } = useTranslation();
  const { rows, pendingApplications, query, setQuery } = useDrivers();
  const [selected, setSelected] = useState<AdminDriverRow | null>(null);
  const [rejecting, setRejecting] = useState<AdminDriverRow | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminDriverRow | null>(null);

  const columns = useMemo<ColumnDef<AdminDriverRow>[]>(
    () => [
      {
        id: "avatar",
        header: "",
        cell: ({ row }) => (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {row.original.name
              .split(/\s+/)
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        ),
        enableHiding: false,
      },
      { accessorKey: "name", header: t("admin.drivers.columns.name"), id: "name" },
      { accessorKey: "vehicle", header: t("admin.drivers.columns.vehicle"), id: "vehicle" },
      { accessorKey: "city", header: t("admin.drivers.columns.city"), id: "city" },
      {
        accessorKey: "status",
        header: t("admin.drivers.columns.status"),
        id: "status",
        cell: ({ row }) => <DriverStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "verification",
        header: t("admin.drivers.columns.verification"),
        id: "verification",
        cell: ({ row }) => <VerificationBadge v={row.original.verification} />,
      },
      { accessorKey: "deliveries", header: t("admin.drivers.columns.deliveries"), id: "deliveries" },
      { accessorKey: "rating", header: t("admin.drivers.columns.rating"), id: "rating" },
      {
        accessorKey: "earnings",
        header: t("admin.drivers.columns.earnings"),
        id: "earnings",
        cell: ({ row }) => formatAppCurrency(row.original.earnings, i18n.language),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" type="button">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelected(row.original)}>{t("admin.drivers.viewDetails")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success(i18n.t("toasts.driverMessageDemo"))}>
                {t("admin.drivers.sendMessage")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSuspendTarget(row.original)}>{t("admin.drivers.suspend")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableHiding: false,
      },
    ],
    [t, i18n.language],
  );

  return (
    <PermissionGate page="drivers">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.drivers.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.drivers.subtitle")}</p>
        </div>

        <Tabs defaultValue="all">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="all">{t("admin.drivers.tabAll")}</TabsTrigger>
              <TabsTrigger value="pending">{t("admin.drivers.tabPending")}</TabsTrigger>
            </TabsList>
            <Input
              placeholder={t("admin.drivers.searchPlaceholder")}
              className="max-w-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <TabsContent value="all" className="mt-4">
            <DataTable columns={columns} data={rows} />
          </TabsContent>

          <TabsContent value="pending" className="mt-4 space-y-4">
            {pendingApplications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="font-medium">{t("admin.drivers.emptyPendingTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("admin.drivers.emptyPendingDesc")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/80">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-start">
                      <th className="p-3 font-medium">{t("admin.drivers.tableDriver")}</th>
                      <th className="p-3 font-medium">{t("admin.drivers.tableVehicle")}</th>
                      <th className="p-3 font-medium">{t("admin.drivers.tableCity")}</th>
                      <th className="p-3 font-medium">{t("admin.drivers.tableDocuments")}</th>
                      <th className="p-3 font-medium">{t("admin.drivers.tableActions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApplications.map((d) => (
                      <tr key={d.id} className="border-b">
                        <td className="p-3 font-medium">{d.name}</td>
                        <td className="p-3 text-muted-foreground">{d.vehicle}</td>
                        <td className="p-3">{d.city}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {DOC_KEYS.map((k) => {
                              const doc = MOCK_DRIVER_DOCS[k];
                              return (
                                <Button key={k} variant="outline" size="sm" className="h-7 gap-1 text-xs" type="button" asChild>
                                  <a href={doc.url}>
                                    <FileText className="h-3 w-3" />
                                    {t(`admin.drivers.documentsMock.${k}`)}
                                  </a>
                                </Button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="gap-1"
                              type="button"
                              onClick={() => toast.success(i18n.t("toasts.approvedDriverDemo", { name: d.name }))}
                            >
                              <Check className="h-3 w-3" />
                              {t("admin.drivers.approve")}
                            </Button>
                            <Button size="sm" variant="destructive" className="gap-1" type="button" onClick={() => setRejecting(d)}>
                              <X className="h-3 w-3" />
                              {t("admin.drivers.reject")}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {t("admin.drivers.sheetTitle")}
              </SheetTitle>
            </SheetHeader>
            {selected ? (
              <div className="mt-6 space-y-3 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("admin.drivers.name")}: </span>
                  {selected.name}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("admin.drivers.vehicle")}: </span>
                  {selected.vehicle}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("admin.drivers.city")}: </span>
                  {selected.city}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("admin.drivers.status")}: </span>
                  <DriverStatusBadge status={selected.status} />
                </p>
                <p>
                  <span className="text-muted-foreground">{t("admin.drivers.verification")}: </span>
                  <VerificationBadge v={selected.verification} />
                </p>
                <p className="font-medium">{t("admin.drivers.documents")}</p>
                <ul className="list-inside list-disc text-muted-foreground">
                  {DOC_KEYS.map((k) => {
                    const doc = MOCK_DRIVER_DOCS[k];
                    const expires = formatAdminDateTime(`${doc.expiresOn}T12:00:00`, i18n.language);
                    return (
                      <li key={k}>
                        {t(`admin.drivers.documentsMock.${k}`)} · {t("admin.drivers.expiresOn", { date: expires })}
                      </li>
                    );
                  })}
                </ul>
                <p className="font-medium">{t("admin.drivers.performance")}</p>
                <p className="text-muted-foreground">
                  {t("admin.drivers.performanceLine", {
                    deliveries: selected.deliveries,
                    rating: selected.rating || t("admin.ordersPage.dash"),
                    earnings: formatAppCurrency(selected.earnings, i18n.language),
                  })}
                </p>
              </div>
            ) : null}
          </SheetContent>
        </Sheet>

        <ConfirmDialog
          open={!!suspendTarget}
          onOpenChange={(o) => !o && setSuspendTarget(null)}
          title={suspendTarget ? t("admin.drivers.suspendTitle", { name: suspendTarget.name }) : ""}
          description={t("admin.drivers.suspendDesc")}
          confirmLabel={t("admin.drivers.suspendConfirm")}
          variant="destructive"
          onConfirm={() => toast.success(i18n.t("toasts.driverSuspendedDemo"))}
        />

        {rejecting ? (
          <DriverRejectModal
            key={i18n.language}
            driverName={rejecting.name}
            onDismiss={() => setRejecting(null)}
            onSubmit={(data) => {
              toast.success(i18n.t("toasts.driverRejected", { name: rejecting.name, reason: data.reason }));
              setRejecting(null);
            }}
          />
        ) : null}
      </div>
    </PermissionGate>
  );
}
