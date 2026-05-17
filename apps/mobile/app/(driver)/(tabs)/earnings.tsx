import { useTranslation } from 'react-i18next';

import { Alert, FlatList, Text, View } from 'react-native';

import { formatIQD } from '@tayralsaad/utils';
import i18next from 'i18next';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { HttpApiError } from '@/lib/api';
import { useDriverEarnings, useRequestPayoutMutation } from '@/queries/driver';

function iqLocale(): 'ar' | 'en' {
  return i18next.language.startsWith('en') ? 'en' : 'ar';
}

export default function DriverEarningsScreen() {
  const { t } = useTranslation();
  const locale = iqLocale();

  const { data, isPending, refetch, isRefetching } = useDriverEarnings();
  const payout = useRequestPayoutMutation();

  return (
    <Screen className="px-5 pt-8">
      <Text className="mb-8 text-xl font-semibold text-ink">{t('navigation.earnings')}</Text>
      {isPending || !data ? (
        <Text className="text-inkSoft">{t('common.loading')}</Text>
      ) : (
        <>
          <View className="mb-4 rounded-2xl bg-surface p-5">
            <Text className="text-sm text-inkSoft">{t('driver.earningsAvailable')}</Text>
            <Text className="mt-4 text-2xl font-bold text-primary">{formatIQD(data.available, locale)}</Text>
          </View>
          <View className="mb-4 rounded-2xl border border-border bg-bg p-5">
            <Text className="text-sm text-inkSoft">{t('driver.earningsPending')}</Text>
            <Text className="mt-2 text-lg font-semibold text-ink">{formatIQD(data.pendingPayout, locale)}</Text>
          </View>
          <View className="mb-8 rounded-2xl border border-border bg-bg p-5">
            <Text className="text-sm text-inkSoft">{t('driver.earningsTotal')}</Text>
            <Text className="mt-2 text-lg font-semibold text-ink">{formatIQD(data.totalEarned, locale)}</Text>
          </View>

          <Button
            disabled={data.available <= 0 || payout.isPending}
            loading={payout.isPending}
            onPress={() =>
              payout.mutate(undefined, {
                onSuccess: () => Alert.alert('', t('driver.payoutRequested')),
                onError: (e: unknown) => {
                  const msg =
                    e instanceof HttpApiError ? (locale === 'en' ? e.messageEn : e.message) : t('errors.UNKNOWN');
                  Alert.alert(t('common.errorTitle'), msg ?? '');
                },
              })
            }
          >
            {t('driver.requestPayout')}
          </Button>

          <Text className="mt-10 text-lg font-semibold text-ink">{t('driver.recentTrips')}</Text>
          <FlatList
            className="mt-4"
            data={data.recent}
            keyExtractor={(r) => `${r.trackingCode}-${r.status}`}
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="mb-4 rounded-xl border border-border bg-surface px-4 py-3">
                <Text className="text-xs uppercase text-inkSoft">{item.trackingCode}</Text>
                <Text className="mt-2 font-medium text-ink">{t(`status.${item.status}`)}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text className="py-10 text-center text-sm text-inkSoft">{t('common.emptyTitle')}</Text>
            }
          />
        </>
      )}
    </Screen>
  );
}
