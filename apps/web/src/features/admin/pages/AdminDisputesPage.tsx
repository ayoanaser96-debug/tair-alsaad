import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Link2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { PermissionGate } from "@/features/admin/components/PermissionGate";
import { createDisputeDecisionSchema, type DisputeDecisionFormValues } from "@/features/admin/formSchemas";
import { useDisputes, type AdminDisputeRow } from "@/features/admin/hooks/useDisputes";
import { cn, formatAdminDateTime } from "@/lib/utils";

function PriorityBadge({ p }: { p: AdminDisputeRow["priority"] }) {
  const { t } = useTranslation();
  const cls =
    p === "high"
      ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
      : p === "medium"
        ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", cls)}>
      {t(`admin.disputes.priority.${p}`)}
    </span>
  );
}

function DisputeDecisionForm({
  onSubmitted,
}: {
  onSubmitted: (data: DisputeDecisionFormValues) => void;
}) {
  const { t, i18n } = useTranslation();
  const schema = useMemo(() => createDisputeDecisionSchema(t), [t, i18n.language]);
  const form = useForm<DisputeDecisionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { decision: "no_action", note: "" },
  });

  return (
    <form
      className="space-y-3 border-t pt-4"
      onSubmit={form.handleSubmit((data) => {
        onSubmitted(data);
        form.reset();
      })}
    >
      <p className="font-medium">{t("admin.disputes.decision")}</p>
      <div className="space-y-2">
        <Label htmlFor="decision">{t("admin.disputes.outcome")}</Label>
        <NativeSelect id="decision" {...form.register("decision")}>
          <option value="no_action">{t("admin.disputes.outcomeNoAction")}</option>
          <option value="sender">{t("admin.disputes.outcomeSender")}</option>
          <option value="driver">{t("admin.disputes.outcomeDriver")}</option>
          <option value="partial">{t("admin.disputes.outcomePartial")}</option>
          <option value="full">{t("admin.disputes.outcomeFull")}</option>
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">{t("admin.disputes.internalNotes")}</Label>
        <Textarea id="note" rows={4} {...form.register("note")} />
        {form.formState.errors.note ? (
          <p className="text-xs text-destructive">{form.formState.errors.note.message}</p>
        ) : null}
      </div>
      <Button type="submit" className="w-full">
        {t("admin.disputes.submitDecision")}
      </Button>
    </form>
  );
}

export function AdminDisputesPage() {
  const { t, i18n } = useTranslation();
  const { rows, query, setQuery } = useDisputes();
  const [detail, setDetail] = useState<AdminDisputeRow | null>(null);

  const openRows = rows.filter((r) => r.status === "open");

  const evidenceLabels = [
    t("admin.disputes.evidencePhoto1"),
    t("admin.disputes.evidencePhoto2"),
    t("admin.disputes.evidenceProof"),
  ];

  return (
    <PermissionGate page="disputes">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.disputes.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.disputes.subtitle")}</p>
        </div>

        <Input
          placeholder={t("admin.disputes.searchPlaceholder")}
          className="max-w-md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {openRows.length === 0 ? (
            <Card className="border-dashed lg:col-span-2">
              <CardContent className="flex flex-col items-center py-12">
                <AlertTriangle className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 font-medium">{t("admin.disputes.emptyTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("admin.disputes.emptyDesc")}</p>
              </CardContent>
            </Card>
          ) : (
            openRows.map((d) => (
              <Card key={d.id} className="border-border/80 shadow-md">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{d.type}</CardTitle>
                      <CardDescription>{d.parties}</CardDescription>
                    </div>
                    <PriorityBadge p={d.priority} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Link2 className="h-4 w-4" />
                    {t("admin.disputes.orderPrefix")}{" "}
                    <span className="font-mono text-foreground">{d.orderId}</span>
                  </p>
                  <p>
                    {t("admin.disputes.reported")} {formatAdminDateTime(d.reportedAt, i18n.language)}
                  </p>
                  <p>
                    {t("admin.disputes.assigned")}{" "}
                    {d.assignee ?? <span className="text-muted-foreground">{t("admin.disputes.unassigned")}</span>}
                  </p>
                  <Button type="button" className="w-full sm:w-auto" onClick={() => setDetail(d)}>
                    {t("admin.disputes.openDetail")}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {detail?.type}
              </SheetTitle>
            </SheetHeader>
            {detail ? (
              <div className="mt-6 space-y-4 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("admin.disputes.orderField")} </span>
                  <Badge variant="outline">{detail.orderId}</Badge>
                </p>
                <p className="font-medium">{t("admin.disputes.conversation")}</p>
                <div className="rounded-lg border bg-muted/40 p-3 text-muted-foreground">{detail.parties}</div>
                <p className="font-medium">{t("admin.disputes.evidence")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {evidenceLabels.map((x) => (
                    <div
                      key={x}
                      className="flex aspect-video items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground"
                    >
                      {x}
                    </div>
                  ))}
                </div>
                <DisputeDecisionForm
                  key={`${i18n.language}-${detail.id}`}
                  onSubmitted={(data) => {
                    toast.success(i18n.t("toasts.decisionRecorded", { decision: data.decision }));
                    setDetail(null);
                  }}
                />
              </div>
            ) : null}
          </SheetContent>
        </Sheet>
      </div>
    </PermissionGate>
  );
}
