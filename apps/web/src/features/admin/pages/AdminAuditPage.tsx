import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { DataTable } from "@/components/shared";
import { PermissionGate } from "@/features/admin/components/PermissionGate";
import { MOCK_AUDIT } from "@/features/admin/mock/data";
import { formatAdminDateTime } from "@/lib/utils";

type AuditRow = (typeof MOCK_AUDIT)[number];

export function AdminAuditPage() {
  const { t, i18n } = useTranslation();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!q.trim()) return MOCK_AUDIT;
    const low = q.toLowerCase();
    return MOCK_AUDIT.filter(
      (a) => a.who.toLowerCase().includes(low) || a.action.includes(low) || a.entity.toLowerCase().includes(low),
    );
  }, [q]);

  const columns = useMemo<ColumnDef<AuditRow>[]>(
    () => [
      {
        accessorKey: "at",
        header: t("admin.audit.columns.when"),
        id: "at",
        cell: ({ row }) => formatAdminDateTime(row.original.at, i18n.language),
      },
      { accessorKey: "who", header: t("admin.audit.columns.admin"), id: "who" },
      { accessorKey: "action", header: t("admin.audit.columns.action"), id: "action" },
      {
        accessorKey: "entity",
        header: t("admin.audit.columns.entity"),
        id: "entity",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.entity}</span>,
      },
    ],
    [t, i18n.language],
  );

  return (
    <PermissionGate page="audit">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.audit.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.audit.subtitle")}</p>
        </div>
        <Input
          placeholder={t("admin.audit.searchPlaceholder")}
          className="max-w-md"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <DataTable columns={columns} data={rows} pageSize={10} />
      </div>
    </PermissionGate>
  );
}
