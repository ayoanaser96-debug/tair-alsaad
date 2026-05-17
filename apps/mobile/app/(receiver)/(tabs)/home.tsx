import { useCallback, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import type { Shipment } from '@tayralsaad/types';
import { formatIQD } from '@tayralsaad/utils';
import i18next from 'i18next';

import { router } from 'expo-router';

import type { Coord } from '@/components/shipment/ShipmentRouteMap';
import { ShipmentRouteMap } from '@/components/shipment/ShipmentRouteMap';
import { Screen } from '@/components/ui/Screen';
import { openWhatsAppForPhone } from '@/lib/whatsapp';
import { mongoId, useIncomingShipmentsInfinite } from '@/queries/shipments';

function iqLocale(): 'ar' | 'en' {
  return i18next.language.startsWith('en') ? 'en' : 'ar';
}

type FilterMode = 'all' | 'active' | 'completed';

function routeCoords(shipment: Shipment): { pickup: Coord; dropoff: Coord } | null {
  const r = shipment as unknown as Record<string, unknown>;
  const pickup = r.pickup as { location?: Coord } | undefined;
  const dropoff = r.dropoff as { location?: Coord } | undefined;
  const pl = pickup?.location;
  const dl = dropoff?.location;
  if (
    !pl ||
    !dl ||
    typeof pl.lat !== 'number' ||
    typeof pl.lng !== 'number' ||
    typeof dl.lat !== 'number' ||
    typeof dl.lng !== 'number'
  ) {
    return null;
  }
  return { pickup: pl, dropoff: dl };
}

function senderPhone(shipment: Shipment): string | undefined {
  const r = shipment as unknown as Record<string, unknown>;
  const raw = typeof r.senderPhone === 'string' ? r.senderPhone : '';
  return raw.trim() ? raw.trim() : undefined;
}

function etaMinutes(shipment: Shipment): number | undefined {
  const r = shipment as unknown as Record<string, unknown>;
  const v = r.etaMinutes;
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function isCompleted(status: string): boolean {
  return status === 'delivered';
}

function isActiveShipment(status: string): boolean {
  return !['delivered', 'cancelled', 'disputed'].includes(status);
}

export default function ReceiverHomeScreen() {
  const { t } = useTranslation();
  const locale = iqLocale();
  const [mode, setMode] = useState<FilterMode>('active');

  const { data, isPending, isError, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useIncomingShipmentsInfinite(true);

  const flattened = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data?.pages]);

  const visible = useMemo(() => {
    return flattened.filter((s) => {
      const st = String(s.status ?? '');
      if (mode === 'active') return isActiveShipment(st);
      if (mode === 'completed') return isCompleted(st);
      return true;
    });
  }, [flattened, mode]);

  const renderRow: ListRenderItem<Shipment> = useCallback(
    ({ item }) => {
      const sid = mongoId(item);
      const coords = routeCoords(item);
      const phone = senderPhone(item);
      const eta = etaMinutes(item);
      const st = String(item.status ?? '');
      const nearby = typeof eta === 'number' && eta <= 15 && ['in_transit', 'picked_up', 'arrived_dropoff'].includes(st);

      const extPkg = item as unknown as { package?: { type?: string; weightTier?: string } };
      const pkgBits = [
        extPkg.package?.type ? String(t(`shipmentNew.pkgTypes.${extPkg.package.type}`, extPkg.package.type)) : '',
        extPkg.package?.weightTier ? String(t(`shipmentNew.weights.${extPkg.package.weightTier}`)) : '',
      ].filter(Boolean);

      const total =
        typeof (item as unknown as { pricing?: { total?: number } }).pricing?.total === 'number'
          ? (item as unknown as { pricing?: { total?: number } }).pricing!.total!
          : 0;

      const senderNm =
        typeof (item as unknown as { senderName?: string }).senderName === 'string'
          ? (item as unknown as { senderName?: string }).senderName!.trim()
          : '';

      return (
        <View className="mb-5 rounded-2xl border border-border bg-surface px-4 py-4">
          <Pressable accessibilityRole="button" onPress={() => router.push(`/(receiver)/tracking/${sid}`)}>
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase text-inkSoft">{item.trackingCode ?? ''}</Text>
                <Text className="mt-2 text-base font-semibold text-ink">{t(`status.${st}`, st)}</Text>
                <Text className="mt-1 text-sm text-inkSoft">{senderNm || '—'}</Text>
                <Text className="mt-2 text-xs text-inkSoft">
                  {[pkgBits.join(' · '), eta != null ? t('receiver.cardEta', { minutes: eta }) : ''].filter(Boolean).join(' · ')}
                </Text>
                {nearby ? (
                  <View className="mt-3 self-start rounded-full bg-bg px-3 py-1">
                    <Text className="text-xs font-semibold text-primary">{t('receiver.nearbyBadge')}</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-lg font-semibold text-primary">{formatIQD(total, locale)}</Text>
            </View>
          </Pressable>

          {coords ? (
            <View className="mt-4 overflow-hidden rounded-xl border border-border">
              <ShipmentRouteMap pickup={coords.pickup} dropoff={coords.dropoff} height={110} />
            </View>
          ) : (
            <View className="mt-4 rounded-xl border border-border bg-bg px-3 py-8">
              <Text className="text-center text-xs text-inkSoft">{t('receiver.mapUnavailable')}</Text>
            </View>
          )}

          {phone ? (
            <Pressable
              accessibilityRole="button"
              className="mt-4 rounded-xl border border-border bg-bg px-4 py-3 active:opacity-80"
              onPress={() => openWhatsAppForPhone(phone, t('receiver.whatsappPreset'))}
            >
              <Text className="text-center text-sm font-semibold text-primary">{t('receiver.whatsappSender')}</Text>
            </Pressable>
          ) : null}
        </View>
      );
    },
    [locale, t],
  );

  const chips: { key: FilterMode; label: string }[] = [
    { key: 'active', label: t('receiver.filterActive') },
    { key: 'all', label: t('receiver.filterAll') },
    { key: 'completed', label: t('receiver.filterCompleted') },
  ];

  return (
    <Screen className="px-5 pb-28 pt-8">
      <Text className="mb-6 text-2xl font-bold text-ink">{t('receiver.titleIncoming')}</Text>

      <View className="mb-6 flex-row flex-wrap gap-2">
        {chips.map((c) => {
          const sel = mode === c.key;
          return (
            <Pressable
              key={c.key}
              accessibilityRole="button"
              onPress={() => setMode(c.key)}
              className={
                sel ? 'rounded-full bg-primary px-4 py-2' : 'rounded-full border border-border bg-bg px-4 py-2'
              }
            >
              <Text className={sel ? 'text-sm font-semibold text-white' : 'text-sm font-medium text-ink'}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {isPending ? (
        <ActivityIndicator />
      ) : isError ? (
        <Text className="text-danger">{t('common.errorTitle')}</Text>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(s) => mongoId(s)}
          renderItem={renderRow}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
          ListEmptyComponent={<Text className="mt-16 text-center text-inkSoft">{t('receiver.emptyIncoming')}</Text>}
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
