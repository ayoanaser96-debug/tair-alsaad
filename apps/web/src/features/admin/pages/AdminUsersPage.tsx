import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, MoreHorizontal, User } from "lucide-react";
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
import { NativeSelect } from "@/components/ui/native-select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog";
import { DataTable } from "@/components/shared";
import { PermissionGate } from "@/features/admin/components/PermissionGate";
import { UserStatusBadge } from "@/features/admin/components/UserStatusBadge";
import { createUserNoteSchema, type UserNoteFormValues } from "@/features/admin/formSchemas";
import { useUsers, type AdminUserRow } from "@/features/admin/hooks/useUsers";
import { formatAdminDateTime, formatAppCurrency } from "@/lib/utils";

function UserNoteForm() {
  const { t, i18n } = useTranslation();
  const schema = useMemo(() => createUserNoteSchema(t), [t, i18n.language]);
  const form = useForm<UserNoteFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { note: "" },
  });

  return (
    <form
      onSubmit={form.handleSubmit(() => {
        toast.success(i18n.t("toasts.noteSaved"));
        form.reset();
      })}
      className="space-y-2"
    >
      <Textarea rows={3} {...form.register("note")} />
      {form.formState.errors.note ? (
        <p className="text-xs text-destructive">{form.formState.errors.note.message}</p>
      ) : null}
      <Button type="submit" size="sm">
        {t("admin.users.saveNote")}
      </Button>
    </form>
  );
}

export function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const { rows, query, setQuery, status, setStatus } = useUsers();
  const [selected, setSelected] = useState<AdminUserRow | null>(null);
  const [confirmBan, setConfirmBan] = useState<AdminUserRow | null>(null);

  const columns = useMemo<ColumnDef<AdminUserRow>[]>(
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
      { accessorKey: "name", header: t("admin.users.columns.name"), id: "name" },
      { accessorKey: "email", header: t("admin.users.columns.email"), id: "email" },
      { accessorKey: "phone", header: t("admin.users.columns.phone"), id: "phone" },
      { accessorKey: "totalOrders", header: t("admin.users.columns.orders"), id: "totalOrders" },
      {
        accessorKey: "totalSpent",
        header: t("admin.users.columns.spent"),
        id: "totalSpent",
        cell: ({ row }) => formatAppCurrency(row.original.totalSpent, i18n.language),
      },
      {
        accessorKey: "joinDate",
        header: t("admin.users.columns.joined"),
        id: "joinDate",
        cell: ({ row }) => formatAdminDateTime(`${row.original.joinDate}T12:00:00`, i18n.language),
      },
      {
        accessorKey: "status",
        header: t("admin.users.columns.status"),
        id: "status",
        cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
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
              <DropdownMenuItem onClick={() => setSelected(row.original)}>{t("admin.users.viewDetails")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success(i18n.t("toasts.messageSentDemo"))}>{t("admin.users.sendMessage")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success(i18n.t("toasts.userSuspendedDemo"))}>{t("admin.users.suspend")}</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => setConfirmBan(row.original)}>
                {t("admin.users.banUser")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableHiding: false,
      },
    ],
    [t, i18n.language],
  );

  return (
    <PermissionGate page="users">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.users.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.users.subtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Input
            placeholder={t("admin.users.searchPlaceholder")}
            className="max-w-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="w-[160px]">
            <option value="all">{t("admin.users.filterAll")}</option>
            <option value="active">{t("admin.users.filterActive")}</option>
            <option value="suspended">{t("admin.users.filterSuspended")}</option>
            <option value="banned">{t("admin.users.filterBanned")}</option>
          </NativeSelect>
          <Button type="button" variant="outline" onClick={() => toast.success(i18n.t("toasts.bulkExportDemo"))}>
            {t("admin.users.bulkExport")}
          </Button>
        </div>

        <DataTable columns={columns} data={rows} />

        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("admin.users.sheetTitle")}
              </SheetTitle>
            </SheetHeader>
            {selected ? (
              <div className="mt-6 space-y-4 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("admin.users.columns.name")}: </span>
                  {selected.name}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("admin.users.columns.email")}: </span>
                  {selected.email}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("admin.users.columns.phone")}: </span>
                  {selected.phone}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("admin.users.columns.status")}: </span>
                  <UserStatusBadge status={selected.status} />
                </p>
                <p>
                  <span className="text-muted-foreground">{t("admin.users.ordersSpent")} </span>
                  {selected.totalOrders} · {formatAppCurrency(selected.totalSpent, i18n.language)}
                </p>
                <p className="mt-4 font-medium">{t("admin.users.orderHistory")}</p>
                <p className="text-muted-foreground">{t("admin.users.orderHistoryWire")}</p>
                <p className="font-medium">{t("admin.users.adminNote")}</p>
                <UserNoteForm key={`${i18n.language}-${selected.id}`} />
                <div className="flex flex-wrap gap-2 pt-4">
                  <Button variant="destructive" type="button" onClick={() => setConfirmBan(selected)}>
                    <Ban className="me-1 h-4 w-4" />
                    {t("admin.users.banUser")}
                  </Button>
                  <Button variant="outline" type="button" onClick={() => toast.success(i18n.t("toasts.refundFlowDemo"))}>
                    {t("admin.users.issueRefund")}
                  </Button>
                </div>
              </div>
            ) : null}
          </SheetContent>
        </Sheet>

        <ConfirmDialog
          open={!!confirmBan}
          onOpenChange={(o) => !o && setConfirmBan(null)}
          title={confirmBan ? t("admin.users.banTitle", { name: confirmBan.name }) : ""}
          description={t("admin.users.banDesc")}
          confirmLabel={t("admin.users.banConfirm")}
          variant="destructive"
          onConfirm={() => {
            toast.success(i18n.t("toasts.userBannedDemo"));
            setSelected(null);
          }}
        />
      </div>
    </PermissionGate>
  );
}
