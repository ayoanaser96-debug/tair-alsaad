import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">{t("notFound.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("notFound.description")}</p>
      <Link to="/dashboard" className="text-sm text-primary underline">
        {t("notFound.backToDashboard")}
      </Link>
    </div>
  );
}
