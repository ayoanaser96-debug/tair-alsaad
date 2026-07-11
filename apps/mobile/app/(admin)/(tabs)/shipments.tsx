import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { useAdminShipments } from '@/queries/admin';

export default function AdminShipmentsTab() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useAdminShipments(page, true);

  const rows = useMemo(() => data?.items ?? [], [data?.items]);

  return (
    <Screen className="bg-surface pt-14 pb-28">
      <View className="mb-4 flex-row items-center justify-between px-4">
        <Text className="text-2xl font-bold text-ink">{t('admin.shipmentsTitle', 'Shipments')}</Text>
        <TouchableOpacity onPress={() => void refetch()}>
          <Text className="text-primary">{t('common.refresh', 'Refresh')}</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-2 flex-row items-center gap-4 px-4">
        <TouchableOpacity onPress={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          <Text className={`text-lg ${page <= 1 ? 'text-stone-300' : 'text-primary'}`}>−</Text>
        </TouchableOpacity>
        <Text className="text-stone-600">
          {t('admin.pageOf', '{{page}} • {{total}}', { page, total: data?.total ?? 0 })}
        </Text>
        <TouchableOpacity
          onPress={() => setPage((p) => p + 1)}
          disabled={(data?.total ?? 0) <= page * 20}
        >
          <Text
            className={`text-lg ${(data?.total ?? 0) <= page * 20 ? 'text-stone-300' : 'text-primary'}`}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && !rows.length ? <ActivityIndicator /> : null}

      <FlatList
        data={rows}
        keyExtractor={(item, i) =>
          `${String((item as Record<string, unknown>)._id ?? (item as Record<string, unknown>).id ?? i)}`
        }
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 24 }}
        renderItem={({ item }) => {
          const row = item as Record<string, unknown>;
          const id = String(row._id ?? row.id ?? '');
          const tracking = typeof row.trackingCode === 'string' ? row.trackingCode : '—';
          const status = typeof row.status === 'string' ? row.status : '';
          const pickup = (row.pickup as { city?: string } | undefined)?.city;
          const drop = (row.dropoff as { city?: string } | undefined)?.city;
          return (
            <Pressable
              accessibilityRole="button"
              disabled={!id}
              onPress={() => id && router.push(`/(admin)/shipment/${id}`)}
              className="rounded-xl border border-stone-200 bg-white p-4 active:opacity-80"
            >
              <Text className="font-bold text-ink">{tracking}</Text>
              <Text className="text-sm text-stone-600 capitalize">{status}</Text>
              {[pickup, drop].filter(Boolean).length ? (
                <Text className="text-xs text-stone-500">{[pickup, drop].filter(Boolean).join(' → ')}</Text>
              ) : null}
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
