import { Inbox, MoreHorizontal, PackageOpen, Truck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { OrderDetail } from "@/features/orders/schemas";
import { useCancelOrderMutation } from "@/features/orders/hooks";
import { EmptyState } from "@/components/layout/EmptyState";
import { KPICard, normalizeOrderStatus, OrderStatusBadge, orderStatusLabel } from "@/components/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks";
import { useSenderOrders } from "@/hooks/useSenderOrders";
import { useSenderStats } from "@/hooks/useSenderStats";
import { formatAdminDateTime, formatAppCurrency } from "@/lib/utils";

import { CreateOrderModal } from "./CreateOrderModal";
import { OrderDetailSheet } from "./OrderDetailSheet";

type TabKey = "active" | "completed" | "cancelled" | "drafts";

function DriverCell({ order }: { order: OrderDetail }) {
  const d = order.driver;
  if (!d) return <span className="text-muted-foreground">—</span>;
  const ini = d.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex items-center gap-2">
      {d.avatarUrl ? (
        <img src={d.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {ini}
        </div>
      )}
      <span className="max-w-[140px] truncate text-sm">{d.name}</span>
    </div>
  );
}

export function SenderDashboardPage() {
  const { t, i18n } = useTranslation();
  const { auth } = useAuth();
  const cancelMutation = useCancelOrderMutation();
  const [tab, setTab] = useState<TabKey>("active");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [sort, setSort] = useState<"newest" | "oldest" | "amount_desc" | "amount_asc">("newest");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const vsPrev = t("sender.dashboard.stats.vsPrevious");

  const statusOptionsByTab = useMemo(() => {
    const st = (code: string) => orderStatusLabel(normalizeOrderStatus(code));
    return {
      active: [
        { value: "", label: t("sender.dashboard.filters.allStatuses") },
        { value: "PENDING", label: st("PENDING") },
        { value: "ASSIGNED", label: st("ASSIGNED") },
        { value: "PICKED_UP", label: st("PICKED_UP") },
        { value: "IN_TRANSIT", label: st("IN_TRANSIT") },
      ],
      completed: [
        { value: "", label: t("sender.dashboard.filters.all") },
        { value: "DELIVERED", label: st("DELIVERED") },
      ],
      cancelled: [
        { value: "", label: t("sender.dashboard.filters.all") },
        { value: "CANCELLED", label: st("CANCELLED") },
      ],
      drafts: [
        { value: "", label: t("sender.dashboard.filters.all") },
        { value: "DRAFT", label: st("DRAFT") },
      ],
    } satisfies Record<TabKey, { value: string; label: string }[]>;
  }, [t, i18n.language]);

  const { data: stats, loading: statsLoading, refetch: refetchStats } = useSenderStats();
  const listParams = useMemo(
    () => ({
      tab,
      page,
      limit: 10,
      search: search || undefined,
      sort,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: statusFilter || undefined,
    }),
    [tab, page, search, sort, dateFrom, dateTo, statusFilter],
  );
  const { data: listData, loading: listLoading, refetch: refetchList } = useSenderOrders(listParams);

  useEffect(() => {
    setPage(1);
  }, [tab, search, sort, statusFilter, dateFrom, dateTo]);

  const refetchAll = useCallback(() => {
    void refetchStats();
    void refetchList();
  }, [refetchStats, refetchList]);

  function openDetail(id: string) {
    setSelectedId(id);
    setDetailOpen(true);
  }

  async function handleCancelOrder(order: OrderDetail) {
    if (!auth?.accessToken) return;
    try {
      await cancelMutation.mutateAsync(order.id);
      refetchAll();
    } catch {
      /* toast in mutation */
    }
  }

  const orders = listData?.orders ?? [];
  const totalPages = listData?.pages ?? 1;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("sender.dashboard.title")}
        subtitle={t("sender.dashboard.subtitle")}
        icon={<Inbox className="h-7 w-7" />}
        actions={
          <Button variant="primary" className="shadow-md" onClick={() => setCreateOpen(true)}>
            {t("sender.dashboard.createOrderCta")}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <KPICard
              label={t("sender.dashboard.stats.totalOrders")}
              value={stats.totals.total}
              icon={<PackageOpen className="h-4 w-4" />}
              trendPct={stats.deltaPct.total}
              vsPreviousLabel={vsPrev}
            />
            <KPICard
              label={t("sender.dashboard.stats.inTransit")}
              value={stats.totals.inTransit}
              icon={<Truck className="h-4 w-4 text-blue-600" />}
              trendPct={stats.deltaPct.inTransit}
              vsPreviousLabel={vsPrev}
            />
            <KPICard
              label={t("sender.dashboard.stats.delivered")}
              value={stats.totals.delivered}
              icon={<PackageOpen className="h-4 w-4 text-emerald-600" />}
              trendPct={stats.deltaPct.delivered}
              vsPreviousLabel={vsPrev}
            />
            <KPICard
              label={t("sender.dashboard.stats.pendingPickup")}
              value={stats.totals.pendingPickup}
              icon={<Inbox className="h-4 w-4 text-amber-600" />}
              trendPct={stats.deltaPct.pendingPickup}
              vsPreviousLabel={vsPrev}
            />
          </>
        ) : null}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-4">
        <TabsList className="grid w-full max-w-xl grid-cols-4 bg-muted/80">
          <TabsTrigger value="active">{t("sender.dashboard.tabs.active")}</TabsTrigger>
          <TabsTrigger value="completed">{t("sender.dashboard.tabs.completed")}</TabsTrigger>
          <TabsTrigger value="cancelled">{t("sender.dashboard.tabs.cancelled")}</TabsTrigger>
          <TabsTrigger value="drafts">{t("sender.dashboard.tabs.drafts")}</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-4 outline-none">
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">{t("sender.dashboard.orders.title")}</CardTitle>
              <CardDescription>{t("sender.dashboard.orders.subtitle")}</CardDescription>
              <div className="flex flex-col gap-3 pt-2 lg:flex-row lg:flex-wrap lg:items-end">
                <SearchInput
                  className="min-w-[200px] flex-1"
                  placeholder={t("sender.dashboard.orders.searchPlaceholder")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onClear={() => setSearchInput("")}
                  clearAriaLabel={t("sender.dashboard.orders.searchClearAria")}
                />
                <div className="flex flex-wrap gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground" htmlFor={`sender-status-${tab}`}>
                      {t("sender.dashboard.filters.status")}
                    </label>
                    <NativeSelect
                      id={`sender-status-${tab}`}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-[160px]"
                    >
                      {statusOptionsByTab[tab].map((o) => (
                        <option key={o.value || "all"} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground" htmlFor="sender-date-from">
                      {t("sender.dashboard.filters.from")}
                    </label>
                    <Input
                      id="sender-date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-[150px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground" htmlFor="sender-date-to">
                      {t("sender.dashboard.filters.to")}
                    </label>
                    <Input
                      id="sender-date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-[150px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground" htmlFor="sender-sort">
                      {t("sender.dashboard.filters.sort")}
                    </label>
                    <NativeSelect
                      id="sender-sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as typeof sort)}
                      className="w-[160px]"
                    >
                      <option value="newest">{t("sender.dashboard.filters.newestFirst")}</option>
                      <option value="oldest">{t("sender.dashboard.filters.oldestFirst")}</option>
                      <option value="amount_desc">{t("sender.dashboard.filters.amountHigh")}</option>
                      <option value="amount_asc">{t("sender.dashboard.filters.amountLow")}</option>
                    </NativeSelect>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {listLoading ? (
                <div className="space-y-2 py-8">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <EmptyState
                  icon={<PackageOpen className="mx-auto h-12 w-12 text-primary" />}
                  title={t("sender.dashboard.orders.emptyTitle")}
                  description={t("sender.dashboard.orders.emptyBody")}
                  action={{ label: t("sender.dashboard.orders.emptyCta"), onClick: () => setCreateOpen(true) }}
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/80">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("sender.dashboard.orders.table.trackingId")}</TableHead>
                        <TableHead>{t("sender.dashboard.orders.table.recipient")}</TableHead>
                        <TableHead>{t("sender.dashboard.orders.table.destination")}</TableHead>
                        <TableHead>{t("sender.dashboard.orders.table.status")}</TableHead>
                        <TableHead>{t("sender.dashboard.orders.table.driver")}</TableHead>
                        <TableHead>{t("sender.dashboard.orders.table.created")}</TableHead>
                        <TableHead className="text-end">{t("sender.dashboard.orders.table.amount")}</TableHead>
                        <TableHead className="w-[52px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell>
                            <button
                              type="button"
                              className="font-mono text-sm font-medium text-primary underline-offset-4 hover:underline"
                              onClick={() => openDetail(o.id)}
                            >
                              {o.trackingCode}
                            </button>
                          </TableCell>
                          <TableCell className="max-w-[140px] truncate">{o.receiverName}</TableCell>
                          <TableCell>{o.city.name}</TableCell>
                          <TableCell>
                            <OrderStatusBadge status={o.status} />
                          </TableCell>
                          <TableCell>
                            <DriverCell order={o} />
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {formatAdminDateTime(o.createdAt, i18n.language)}
                          </TableCell>
                          <TableCell className="text-end font-medium">
                            {formatAppCurrency(o.price, i18n.language)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label={t("sender.dashboard.orders.actionsMenuAria")}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openDetail(o.id)}>
                                  {t("sender.dashboard.orders.view")}
                                </DropdownMenuItem>
                                {["PENDING", "ASSIGNED", "DRAFT"].includes(o.status) ? (
                                  <DropdownMenuItem className="text-destructive" onClick={() => void handleCancelOrder(o)}>
                                    {t("sender.dashboard.orders.cancel")}
                                  </DropdownMenuItem>
                                ) : null}
                                {o.status === "DELIVERED" && o.rating == null ? (
                                  <DropdownMenuItem onClick={() => openDetail(o.id)}>
                                    {t("sender.dashboard.orders.rate")}
                                  </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link to="/dashboard/sender/support" className="cursor-pointer">
                                    {t("sender.dashboard.orders.help")}
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {orders.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    {t("sender.dashboard.orders.pagination", {
                      page: listData?.page ?? 1,
                      totalPages,
                      count: listData?.total ?? 0,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      {t("sender.dashboard.orders.previous")}
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                      {t("sender.dashboard.orders.next")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateOrderModal open={createOpen} onOpenChange={setCreateOpen} onSuccess={() => refetchAll()} />

      <OrderDetailSheet orderId={selectedId} open={detailOpen} onOpenChange={setDetailOpen} onUpdated={refetchAll} />
    </div>
  );
}
