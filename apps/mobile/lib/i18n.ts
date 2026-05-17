import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

import locales from '@tayralsaad/i18n';

import i18next from 'i18next';

import { initReactI18next } from 'react-i18next';

import { LOCALE_KEY } from './secure';

async function preferredLocale(): Promise<'ar' | 'en'> {
  const saved = await SecureStore.getItemAsync(LOCALE_KEY);
  if (saved === 'ar' || saved === 'en') return saved;
  const device = Localization.getLocales()[0]?.languageCode ?? 'ar';
  return device.startsWith('en') ? 'en' : 'ar';
}

/** Call once during app bootstrap — must finish before mounting UI strings. */
export async function initI18n(): Promise<void> {
  const lng = await preferredLocale();

  await i18next.use(initReactI18next).init({
    lng,
    fallbackLng: 'ar',
    resources: {
      ar: { translation: locales.ar },
      en: { translation: locales.en },
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export default i18next;
