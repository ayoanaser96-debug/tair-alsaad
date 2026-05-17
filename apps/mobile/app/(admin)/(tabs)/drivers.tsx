import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { HttpApiError } from '@/lib/api';
import { useAdminDriverStatusMutation, useAdminDrivers } from '@/queries/admin';

export default function AdminDriversTab() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'ar';

  const [scope, setScope] = useState<'pending' | 'all'>('pending');
  const [page, setPage] = useState(1);

  const statusFilter = scope === 'pending' ? 'pending_review' : undefined;

  const { data, isLoading, refetch, isRefetching } = useAdminDrivers(page, true, statusFilter);
  const rows = useMemo(() => data?.items ?? [], [data?.items]);

  const mutation = useAdminDriverStatusMutation();

  const msgForErr = (e: unknown) =>
    e instanceof HttpApiError ? (locale === 'en' ? e.messageEn : e.message) : t('errors.UNKNOWN');

  const driverId = (row: (typeof rows)[number]) => String(row._id ?? '');

  const confirmMutate = (id: string, status: 'active' | 'rejected') => {
    const title = status === 'active' ? t('admin.driversApproveConfirm') : t('admin.driversRejectConfirm');
    Alert.alert(title, undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: status === 'active' ? t('admin.approve') : t('admin.reject'),
        style: status === 'active' ? 'default' : 'destructive',
        onPress: () =>
          mutation.mutate(
            { driverId: id, status },
            {
              onError: (e: unknown) => Alert.alert(t('common.errorTitle'), msgForErr(e)),
            },
          ),
      },
    ]);
  };

  return (
    <Screen className="bg-bg pt-14 pb-28">
      <View className="mb-6 px-4">
        <Text className="text-2xl font-bold text-ink">{t('admin.driversTitle')}</Text>
        <View className="mt-5 flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setScope('pending');
              setPage(1);
            }}
            className={`flex-1 rounded-full px-4 py-3 ${scope === 'pending' ? 'bg-primary' : 'border border-border bg-surface'}`}
          >
            <Text className={`text-center text-sm font-semibold ${scope === 'pending' ? 'text-white' : 'text-ink'}`}>
              {t('admin.filterPending')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setScope('all');
              setPage(1);
            }}
            className={`flex-1 rounded-full px-4 py-3 ${scope === 'all' ? 'bg-primary' : 'border border-border bg-surface'}`}
          >
            <Text className={`text-center text-sm font-semibold ${scope === 'all' ? 'text-white' : 'text-ink'}`}>
              {t('admin.filterAllDrivers')}
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="mb-4 flex-row items-center justify-between px-4">
        <Pressable accessibilityRole="button" onPress={() => void refetch()}>
          <Text className="text-primary">{t('common.refresh')}</Text>
        </Pressable>
        <View className="flex-row items-center gap-4">
          <Pressable accessibilityRole="button" onPress={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <Text className={`text-lg ${page <= 1 ? 'text-inkSoft' : 'text-primary'}`}>−</Text>
          </Pressable>
          <Text className="text-inkSoft">{t('admin.pageTotal', { n: data?.total ?? 0 })}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPage((p) => p + 1)}
            disabled={(data?.total ?? 0) <= page * 20}
          >
            <Text className={`text-lg ${(data?.total ?? 0) <= page * 20 ? 'text-inkSoft' : 'text-primary'}`}>+</Text>
          </Pressable>
        </View>
      </View>

      {isLoading && !rows.length ? <ActivityIndicator /> : null}

      <FlatList
        data={rows}
        keyExtractor={(item, i) => `${driverId(item)}-${i}`}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 120 }}
        renderItem={({ item }) => {
          const id = driverId(item);
          const u = item.userId as { name?: string; phone?: string } | undefined;
          const pending = String(item.status ?? '') === 'pending_review';
          return (
            <View className="rounded-xl border border-border bg-surface p-4">
              <Text className="font-semibold text-ink">{u?.name ?? '—'}</Text>
              <Text className="text-sm text-inkSoft">{u?.phone ?? ''}</Text>
              <Text className="mt-2 text-xs text-inkSoft">
                {`${String(item.status ?? '')} · ${item.isOnline ? t('admin.driverOnlineOnline') : t('admin.driverOnlineOffline')}`}
              </Text>
              {pending ? (
                <View className="mt-4 flex-row gap-3">
                  <Pressable
                    accessibilityRole="button"
                    disabled={mutation.isPending}
                    className="flex-1 rounded-xl bg-primary px-3 py-3"
                    onPress={() => confirmMutate(id, 'active')}
                  >
                    <Text className="text-center text-sm font-semibold text-white">{t('admin.approve')}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={mutation.isPending}
                    className="flex-1 rounded-xl border border-danger px-3 py-3"
                    onPress={() => confirmMutate(id, 'rejected')}
                  >
                    <Text className="text-center text-sm font-semibold text-danger">{t('admin.reject')}</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </Screen>
  );
}
