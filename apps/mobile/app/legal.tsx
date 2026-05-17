import { useTranslation } from 'react-i18next';

import * as Linking from 'expo-linking';

import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';

export default function LegalScreen() {
  const { t } = useTranslation();

  const privacy = String(t('legal.privacyUrl'));
  const terms = String(t('legal.termsUrl'));

  return (
    <Screen className="px-5 pt-8">
      <Text className="mb-10 text-xl font-semibold text-ink">{t('legal.title')}</Text>

      <View className="gap-6">
        <Pressable accessibilityRole="link" className="rounded-2xl bg-surface px-4 py-5" onPress={() => Linking.openURL(privacy)}>
          <Text className="text-lg font-medium text-primary">{t('legal.privacy')}</Text>
        </Pressable>
        <Pressable accessibilityRole="link" className="rounded-2xl bg-surface px-4 py-5" onPress={() => Linking.openURL(terms)}>
          <Text className="text-lg font-medium text-primary">{t('legal.terms')}</Text>
        </Pressable>
      </View>

      <Text className="mt-10 text-center text-sm text-inkSoft">{t('misc.legalNote')}</Text>
    </Screen>
  );
}
