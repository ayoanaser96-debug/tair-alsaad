import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { PermissionGate } from "@/features/admin/components/PermissionGate";

const TICKETS = [
  { id: "T-1024", user: "ali@example.com", topic: "Payment not showing", status: "open" as const, priority: "high" as const },
  { id: "T-1020", user: "+6019…", topic: "Driver late", status: "waiting" as const, priority: "medium" as const },
];

export function AdminSupportPage() {
  const { t } = useTranslation();

  return (
    <PermissionGate page="support">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.support.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.support.subtitle")}</p>
        </div>

        <div className="grid gap-3">
          {TICKETS.map((ticket) => (
            <Card key={ticket.id} className="border-border/80 shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    {ticket.id}
                  </CardTitle>
                  <CardDescription>{ticket.user}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {ticket.status === "open" ? t("admin.support.statusOpen") : t("admin.support.statusWaiting")}
                  </Badge>
                  <Badge variant="outline">
                    {ticket.priority === "high" ? t("admin.support.priorityHigh") : t("admin.support.priorityMedium")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm">{ticket.topic}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PermissionGate>
  );
}
