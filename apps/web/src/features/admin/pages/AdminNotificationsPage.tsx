import { zodResolver } from "@hookform/resolvers/zod";
import { Radio } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { PermissionGate } from "@/features/admin/components/PermissionGate";
import { createBroadcastFormSchema, type BroadcastFormValues } from "@/features/admin/formSchemas";

function BroadcastComposeForm() {
  const { t, i18n } = useTranslation();
  const schema = useMemo(() => createBroadcastFormSchema(t), [t, i18n.language]);
  const form = useForm<BroadcastFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { audience: "all_senders", title: "", body: "" },
  });

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Radio className="h-5 w-5 text-primary" />
          {t("admin.notifications.composeTitle")}
        </CardTitle>
        <CardDescription>{t("admin.notifications.composeDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(() => {
            toast.success(i18n.t("toasts.broadcastDemo"));
            form.reset();
          })}
        >
          <div className="space-y-2">
            <Label>{t("admin.notifications.audience")}</Label>
            <NativeSelect {...form.register("audience")}>
              <option value="all_senders">{t("admin.notifications.audienceSenders")}</option>
              <option value="all_drivers">{t("admin.notifications.audienceDrivers")}</option>
              <option value="both">{t("admin.notifications.audienceBoth")}</option>
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">{t("admin.notifications.titleField")}</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">{t("admin.notifications.message")}</Label>
            <Textarea id="body" rows={5} {...form.register("body")} />
            {form.formState.errors.body ? (
              <p className="text-xs text-destructive">{form.formState.errors.body.message}</p>
            ) : null}
          </div>
          <Button type="submit">{t("admin.notifications.send")}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminNotificationsPage() {
  const { t, i18n } = useTranslation();

  return (
    <PermissionGate page="notifications">
      <div className="space-y-6">
        <AdminHeader />
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.notifications.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.notifications.subtitle")}</p>
        </div>

        <BroadcastComposeForm key={i18n.language} />
      </div>
    </PermissionGate>
  );
}
