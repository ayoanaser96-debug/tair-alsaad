import { useCallback, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { FlatList, type ListRenderItem, Pressable, RefreshControl, Text, View } from 'react-native';

import type { ShipmentStatus } from '@tayralsaad/types';
import { formatIQD } from '@tayralsaad/utils';

import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { mongoId, useMyShipmentsInfinite } from '@/queries/shipments';

type Segment = 'active' | 'completed' | 'cancelled';

function segmentOf(status: ShipmentStatus): Segment {
  if (status === 'delivered') return 'completed';
  if (status === 'cancelled' || status === 'disputed') return 'cancelled';
  return 'active';
}

export default function SenderHistoryScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'ar';

  const [segment, setSegment] = useState<Segment>('active');
  const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage, refetch, isRefetching } =
    useMyShipmentsInfinite();

  const flattened = data?.pages.flatMap((p) => p.items) ?? [];
  const visible = flattened.filter((s) => segmentOf(String(s.status) as ShipmentStatus) === segment);

  const renderRow: ListRenderItem<(typeof visible)[number]> = useCallback(
    ({ item }) => {
      const sid = mongoId(item);
      const st = String(item.status ?? '');
      const ext = item as unknown as {
        pickup?: { area?: string };
        dropoff?: { area?: string };
        pricing?: { total?: number };
      };
      const total = typeof ext.pricing?.total === 'number' ? ext.pricing.total : 0;

      return (
        <Pressable
          className="mb-4 rounded-2xl border border-border bg-surface px-4 py-4"
          accessibilityRole="button"
          onPress={() => router.push(`/(sender)/shipments/${sid}`)}
        >
          <Text className="text-xs font-semibold uppercase text-inkSoft">{item.trackingCode}</Text>
          <Text className="mt-2 text-base font-semibold text-ink">{t(`status.${st}`, st)}</Text>
          <Text className="mt-2 text-xs text-inkSoft">
            {ext.pickup?.area ?? ''} → {ext.dropoff?.area ?? ''}
          </Text>
          <Text className="mt-4 text-lg font-semibold text-primary">{formatIQD(total, locale)}</Text>
        </Pressable>
      );
    },
    [locale, t],
  );

  const segments = useMemo(
    () =>
      ({
        active: t('shipmentNew.segmentActive'),
        completed: t('shipmentNew.segmentCompleted'),
        cancelled: t('shipmentNew.segmentCancelled'),
      }) satisfies Record<Segment, string>,
    [t],
  );

  return (
    <Screen className="px-5 pb-24 pt-8">
      <Text className="mb-8 text-xl font-semibold text-ink">{t('navigation.history')}</Text>

      <View className="mb-6 flex-row gap-3">
        {(Object.keys(segments) as Segment[]).map((key) => {
          const sel = segment === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              onPress={() => setSegment(key)}
              className={sel ? 'flex-1 rounded-xl bg-primary px-3 py-2' : 'flex-1 rounded-xl border border-border bg-bg px-3 py-2'}
            >
              <Text className={sel ? 'text-center text-sm font-semibold text-white' : 'text-center text-sm font-medium text-ink'}>
                {segments[key]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!isPending && visible.length === 0 ? (
        <View className="mt-24 items-center px-6">
          <Text className="text-center text-ink">{t('shipmentNew.listEmptyFiltered')}</Text>
        </View>
      ) : null}

      <FlatList
        data={visible}
        keyExtractor={(s) => mongoId(s)}
        renderItem={renderRow}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        ListFooterComponent={
          isFetchingNextPage ? <Text className="py-6 text-center text-inkSoft">{t('common.loading')}</Text> : null
        }
        onEndReachedThreshold={0.3}
        onEndReached={() => {
          if (hasNextPage) void fetchNextPage();
        }}
      />
    </Screen>
  );
}
