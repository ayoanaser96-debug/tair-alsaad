import { useTranslation } from "react-i18next";

import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

type Props = {
  id?: string;
  showLabel?: boolean;
  className?: string;
};

export function LanguageSwitcher({ id = "language-switcher", showLabel = true, className }: Props) {
  const { i18n, t } = useTranslation();
  const value = i18n.language ? (i18n.language.toLowerCase().startsWith("ar") ? "ar" : "en") : "en";

  const select = (
    <NativeSelect
      id={id}
      className={className}
      value={value}
      aria-label={t("language.label")}
      onChange={(e) => {
        const next = e.target.value as "en" | "ar";
        void i18n.changeLanguage(next);
      }}
    >
      <option value="en">{t("language.english")}</option>
      <option value="ar">{t("language.arabic")}</option>
    </NativeSelect>
  );

  if (!showLabel) return select;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{t("language.label")}</Label>
      {select}
    </div>
  );
}
