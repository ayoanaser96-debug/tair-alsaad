import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { PermissionGate } from "@/features/admin/components/PermissionGate";
import { getAdminSubRole, setAdminSubRole, type AdminSubRole } from "@/features/admin/permissions";

export function AdminSettingsPage() {
  const { t, i18n } = useTranslation();
  const role = getAdminSubRole();

  return (
    <PermissionGate page="settings">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.appSettings.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.appSettings.subtitle")}</p>
        </div>

        <Card className="max-w-lg border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">{t("admin.appSettings.simTitle")}</CardTitle>
            <CardDescription>{t("admin.appSettings.simDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="subrole">{t("admin.appSettings.subrole")}</Label>
              <NativeSelect
                id="subrole"
                value={role}
                onChange={(e) => {
                  setAdminSubRole(e.target.value as AdminSubRole);
                  toast.success(i18n.t("toasts.roleSet", { role: e.target.value }));
                }}
              >
                <option value="super_admin">{t("admin.appSettings.roleSuper")}</option>
                <option value="support_admin">{t("admin.appSettings.roleSupport")}</option>
                <option value="finance_admin">{t("admin.appSettings.roleFinance")}</option>
                <option value="read_only">{t("admin.appSettings.roleReadOnly")}</option>
              </NativeSelect>
            </div>
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              {t("admin.appSettings.reload")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
