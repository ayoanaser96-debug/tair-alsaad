import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import { CreateOrderForm } from "./CreateOrderForm";

export function SenderCreateOrderPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/sender" aria-label={t("actions.back", { defaultValue: "Back" })}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{t("orders.create.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("orders.create.subtitle")}</p>
        </div>
      </div>
      <CreateOrderForm variant="page" onSuccess={() => navigate("/dashboard/sender")} />
    </div>
  );
}
