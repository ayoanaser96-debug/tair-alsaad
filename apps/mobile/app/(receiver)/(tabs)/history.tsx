import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Pressable,
  RefreshControl,
  Text,
} from 'react-native';

import type { Shipment } from '@tayralsaad/types';
import { formatIQD } from '@tayralsaad/utils';
import i18next from 'i18next';

import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { mongoId, useIncomingShipmentsInfinite } from '@/queries/shipments';

function iqLocale(): 'ar' | 'en' {
  return i18next.language.startsWith('en') ? 'en' : 'ar';
}

export default function ReceiverHistoryScreen() {
  const { t } = useTranslation();
  const locale = iqLocale();

  const { data, isPending, isError, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useIncomingShipmentsInfinite(true);

  const flattened = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data?.pages]);

  const delivered = useMemo(
    () => flattened.filter((s) => String(s.status ?? '') === 'delivered').slice(0, 50),
    [flattened],
  );

  const renderRow: ListRenderItem<Shipment> = useCallback(
    ({ item }) => {
      const sid = mongoId(item);
      const st = String(item.status ?? '');
      const total =
        typeof (item as unknown as { pricing?: { total?: number } }).pricing?.total === 'number'
          ? (item as unknown as { pricing?: { total?: number } }).pricing!.total!
          : 0;

      return (
        <Pressable
          accessibilityRole="button"
          className="mb-4 rounded-2xl border border-border bg-surface px-4 py-4"
          onPress={() => router.push(`/(receiver)/tracking/${sid}`)}
        >
          <Text className="text-xs font-semibold uppercase text-inkSoft">{item.trackingCode ?? ''}</Text>
          <Text className="mt-2 text-base font-semibold text-ink">{t(`status.${st}`, st)}</Text>
          <Text className="mt-4 text-lg font-semibold text-primary">{formatIQD(total, locale)}</Text>
        </Pressable>
      );
    },
    [locale, t],
  );

  return (
    <Screen className="px-5 pb-28 pt-8">
      <Text className="mb-8 text-xl font-semibold text-ink">{t('receiver.historyTitle')}</Text>

      {isPending ? (
        <ActivityIndicator />
      ) : isError ? (
        <Text className="text-danger">{t('common.errorTitle')}</Text>
      ) : (
        <FlatList
          data={delivered}
          keyExtractor={(s) => mongoId(s)}
          renderItem={renderRow}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
          ListEmptyComponent={<Text className="mt-16 text-center text-inkSoft">{t('common.emptyTitle')}</Text>}
          onEndReachedThreshold={0.35}
          onEndReached={() => {
            if (hasNextPage) void fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <Text className="py-6 text-center text-sm text-inkSoft">{t('common.loading')}</Text>
            ) : null
          }
        />
      )}
    </Screen>
  );
}
