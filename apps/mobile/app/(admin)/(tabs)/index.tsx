import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { formatIQD } from '@tayralsaad/utils';

import { Screen } from '@/components/ui/Screen';
import { useAdminOverview } from '@/queries/admin';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[46%] flex-1 rounded-xl border border-border bg-surface px-4 py-4">
      <Text className="text-xs uppercase text-inkSoft">{label}</Text>
      <Text className="mt-2 text-xl font-bold text-ink">{value}</Text>
    </View>
  );
}

export default function AdminOverviewTab() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'ar';

  const { data, isLoading, isError, error } = useAdminOverview(true);

  const recent = useMemo(() => data?.recentShipments?.slice(0, 8) ?? [], [data?.recentShipments]);

  return (
    <Screen className="bg-bg pb-28 pt-14">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text className="mb-6 text-2xl font-bold text-ink">{t('admin.dashboardTitle')}</Text>

        {isLoading ? (
          <ActivityIndicator />
        ) : isError ? (
          <Text className="text-danger">{error instanceof Error ? error.message : t('common.errorTitle')}</Text>
        ) : data ? (
          <>
            <View className="flex-row flex-wrap gap-3">
              <StatCard label={t('admin.stats.users')} value={String(data.totalUsers ?? 0)} />
              <StatCard label={t('admin.stats.shipments')} value={String(data.shipmentsInFlight ?? 0)} />
              <StatCard label={t('admin.stats.drivers')} value={String(data.totalDrivers ?? 0)} />
              <StatCard label={t('admin.stats.revenue')} value={formatIQD(data.gmvToday ?? 0, locale)} />
            </View>

            <Text className="mt-10 text-lg font-semibold text-ink">{t('admin.recent')}</Text>
            <View className="mt-4 gap-3">
              {recent.map((s, idx) => (
                <View key={`${String(s.trackingCode ?? '')}-${idx}`} className="rounded-xl border border-border bg-surface px-3 py-3">
                  <Text className="font-semibold text-ink">{s.trackingCode ?? '—'}</Text>
                  <Text className="text-xs text-inkSoft">{[s.pickup?.city, s.dropoff?.city].filter(Boolean).join(' → ')}</Text>
                  <Text className="mt-1 text-xs capitalize text-primary">{String(s.status ?? '')}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
