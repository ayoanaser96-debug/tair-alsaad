import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

/** Persisted language; must match inline script in index.html */
export const PREFERRED_LANGUAGE_KEY = "preferredLanguage";

export type AppLanguage = "en" | "ar";

export function normalizeLanguage(lng: string): AppLanguage {
  return lng.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function applyDocumentLanguage(lng: string) {
  const norm = normalizeLanguage(lng);
  document.documentElement.lang = norm === "ar" ? "ar" : "en";
  document.documentElement.dir = norm === "ar" ? "rtl" : "ltr";
}

function readInitialLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(PREFERRED_LANGUAGE_KEY);
    if (stored === "en" || stored === "ar") return stored;
  } catch {
    /* ignore */
  }
  if (typeof navigator !== "undefined") {
    const nav = navigator.language?.toLowerCase() ?? "";
    if (nav.startsWith("ar")) return "ar";
  }
  return "en";
}

const initial = readInitialLanguage();
applyDocumentLanguage(initial);

function syncDocumentTitle() {
  try {
    document.title = i18n.t("meta.title");
  } catch {
    /* ignore */
  }
}

void i18n
  .use(initReactI18next)
  .init({
    lng: initial,
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    load: "languageOnly",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
  .then(syncDocumentTitle);

i18n.on("languageChanged", (lng) => {
  const norm = normalizeLanguage(lng);
  applyDocumentLanguage(norm);
  syncDocumentTitle();
  try {
    localStorage.setItem(PREFERRED_LANGUAGE_KEY, norm);
  } catch {
    /* ignore */
  }
});

export default i18n;
