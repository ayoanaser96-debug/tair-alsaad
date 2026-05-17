import type { ColumnDef } from "@tanstack/react-table";
import { Shield } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { DataTable } from "@/components/shared";
import { PermissionGate } from "@/features/admin/components/PermissionGate";
import { MOCK_ADMIN_USERS } from "@/features/admin/mock/data";
import { cn } from "@/lib/utils";

type Row = (typeof MOCK_ADMIN_USERS)[number];

export function AdminRolesPage() {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: "name", header: t("admin.roles.columns.name"), id: "name" },
      { accessorKey: "email", header: t("admin.roles.columns.email"), id: "email" },
      {
        accessorKey: "role",
        header: t("admin.roles.columns.permission"),
        id: "role",
        cell: ({ row }) => (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              row.original.role === "super_admin" && "bg-primary/15 text-primary",
            )}
          >
            {t(`admin.roles.roleLabels.${row.original.role}`)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <Button size="sm" variant="outline" type="button">
            {t("admin.roles.columns.edit")}
          </Button>
        ),
        enableHiding: false,
      },
    ],
    [t],
  );

  return (
    <PermissionGate page="roles">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.roles.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.roles.subtitle")}</p>
        </div>

        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-primary" />
              {t("admin.roles.cardTitle")}
            </CardTitle>
            <CardDescription>{t("admin.roles.cardDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={MOCK_ADMIN_USERS} pageSize={10} />
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
