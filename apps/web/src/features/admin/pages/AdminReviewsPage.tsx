import type { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { DataTable } from "@/components/shared";
import { PermissionGate } from "@/features/admin/components/PermissionGate";
import { formatAdminDateTime } from "@/lib/utils";

type ReviewRow = { id: string; orderId: string; from: string; target: string; rating: number; comment: string; at: string };

const MOCK: ReviewRow[] = [
  { id: "r1", orderId: "ord-1", from: "Sender", target: "Raju Kumar", rating: 5, comment: "Fast delivery", at: "2026-04-17" },
  { id: "r2", orderId: "ord-2", from: "Sender", target: "Mei Chen", rating: 4, comment: "Good comms", at: "2026-04-16" },
];

export function AdminReviewsPage() {
  const { t, i18n } = useTranslation();

  const columns = useMemo<ColumnDef<ReviewRow>[]>(
    () => [
      { accessorKey: "orderId", header: t("admin.reviews.columns.order"), id: "orderId" },
      { accessorKey: "target", header: t("admin.reviews.columns.driver"), id: "target" },
      {
        accessorKey: "rating",
        header: t("admin.reviews.columns.rating"),
        id: "rating",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            {row.original.rating}
          </span>
        ),
      },
      { accessorKey: "comment", header: t("admin.reviews.columns.comment"), id: "comment" },
      {
        accessorKey: "at",
        header: t("admin.reviews.columns.date"),
        id: "at",
        cell: ({ row }) => formatAdminDateTime(`${row.original.at}T12:00:00`, i18n.language),
      },
    ],
    [t, i18n.language],
  );

  return (
    <PermissionGate page="reviews">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.reviews.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.reviews.subtitle")}</p>
        </div>
        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">{t("admin.reviews.cardTitle")}</CardTitle>
            <CardDescription>{t("admin.reviews.cardDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={MOCK} pageSize={10} />
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
