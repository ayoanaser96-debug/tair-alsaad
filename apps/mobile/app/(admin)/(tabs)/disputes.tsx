import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { useAdminDisputes } from '@/queries/admin';

export default function AdminDisputesTab() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useAdminDisputes(page, true);
  const rows = useMemo(() => data?.items ?? [], [data?.items]);

  return (
    <Screen className="bg-surface pt-14 pb-28">
      <View className="mb-4 flex-row items-center justify-between px-4">
        <Text className="text-2xl font-bold text-ink">{t('admin.disputesTitle', 'Open disputes')}</Text>
        <TouchableOpacity onPress={() => void refetch()}>
          <Text className="text-primary">{t('common.refresh', 'Refresh')}</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-2 flex-row items-center gap-4 px-4">
        <TouchableOpacity onPress={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          <Text className={`text-lg ${page <= 1 ? 'text-stone-300' : 'text-primary'}`}>−</Text>
        </TouchableOpacity>
        <Text className="text-stone-600">{t('admin.pageTotal', '{{n}} total', { n: data?.total ?? 0 })}</Text>
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
        keyExtractor={(item, i) => `${String(item._id ?? i)}`}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => {
          const dispute = item.dispute as { reason?: string } | undefined;
          return (
            <View className="rounded-xl border border-stone-200 bg-white p-4">
              <Text className="font-semibold text-ink">{String(item.trackingCode ?? '—')}</Text>
              {dispute?.reason ? <Text className="mt-1 text-xs text-stone-600">{dispute.reason}</Text> : null}
            </View>
          );
        }}
      />
    </Screen>
  );
}
