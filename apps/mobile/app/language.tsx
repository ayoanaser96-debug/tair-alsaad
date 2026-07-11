import * as SecureStore from 'expo-secure-store';
import i18next from '@/lib/i18n';
import { router } from 'expo-router';
import { Alert, DevSettings, I18nManager, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/Screen';

import { LOCALE_KEY } from '@/lib/secure';

async function applyLanguage(nextLng: 'ar' | 'en'): Promise<boolean> {
  await SecureStore.setItemAsync(LOCALE_KEY, nextLng).catch(() => undefined);
  await i18next.changeLanguage(nextLng);

  const wantRtl = nextLng === 'ar';
  I18nManager.allowRTL(true);
  const needsRestart = I18nManager.isRTL !== wantRtl;
  if (needsRestart) {
    I18nManager.forceRTL(wantRtl);
  }
  return needsRestart;
}

export default function LanguageScreen() {
  const { t } = useTranslation();

  const promptReload = async (needsRestart: boolean) => {
    Alert.alert(t('language.reloadTitle'), t('language.reloadMessage'), [
      {
        text: t('language.reloadAction'),
        onPress: () => {
          if (needsRestart) DevSettings.reload();
          else router.back();
        },
      },
      { text: t('common.close'), style: 'cancel', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen className="px-5 pt-8">
      <Text className="mb-12 text-xl font-semibold text-ink">{t('language.title')}</Text>

      <Pressable
        accessibilityRole="button"
        className="mb-4 rounded-2xl bg-surface px-4 py-5"
        onPress={async () => {
          const needs = await applyLanguage('ar');
          await promptReload(needs);
        }}
      >
        <Text className="text-lg font-semibold text-ink">{t('language.ar')} · RTL</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        className="rounded-2xl bg-surface px-4 py-5"
        onPress={async () => {
          const needs = await applyLanguage('en');
          await promptReload(needs);
        }}
      >
        <Text className="text-lg font-semibold text-ink">{t('language.en')} · LTR</Text>
      </Pressable>
    </Screen>
  );
}
