import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';

export default function AdminReportsTab() {
  const { t } = useTranslation();

  return (
    <Screen className="bg-bg pb-28 pt-14">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 120 }}>
        <Text className="text-2xl font-bold text-ink">{t('admin.reportsTitle')}</Text>

        <View className="rounded-2xl border border-border bg-surface px-5 py-5">
          <Text className="text-lg font-semibold text-primary">{t('admin.demandHigh')}</Text>
          <Text className="mt-3 text-sm leading-6 text-inkSoft">{t('admin.demandSubtitle')}</Text>
        </View>

        <View className="rounded-2xl border border-dashed border-border bg-bg px-5 py-16">
          <Text className="text-center text-sm text-inkSoft">{t('admin.mapPlaceholder')}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          className="rounded-2xl border border-border bg-surface px-5 py-5 active:opacity-80"
          onPress={() => router.push('/(admin)/(tabs)/shipments')}
        >
          <Text className="text-base font-semibold text-ink">{t('admin.linkShipments')}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="rounded-2xl border border-border bg-surface px-5 py-5 active:opacity-80"
          onPress={() => router.push('/(admin)/(tabs)/disputes')}
        >
          <Text className="text-base font-semibold text-ink">{t('admin.linkDisputes')}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
