import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/ui/Screen';
import type { AdminUserRow } from '@/queries/admin';
import { useAdminUsersInfinite } from '@/queries/admin';

export default function AdminUsersTab() {
  const { t } = useTranslation();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, refetch, isRefetching } =
    useAdminUsersInfinite(true);

  const rows = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data?.pages]);
  const [selected, setSelected] = useState<AdminUserRow | null>(null);

  return (
    <Screen className="bg-bg pb-28 pt-14">
      <Text className="mb-6 px-4 text-2xl font-bold text-ink">{t('admin.usersTitle')}</Text>

      {isPending ? (
        <ActivityIndicator />
      ) : isError ? (
        <Text className="px-4 text-danger">{t('common.errorTitle')}</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 140 }}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              className="rounded-xl border border-border bg-surface px-4 py-4 active:opacity-80"
              onPress={() => setSelected(item)}
            >
              <Text className="text-xs uppercase text-inkSoft">{item.phone}</Text>
              <Text className="mt-2 text-lg font-semibold text-ink">{item.name}</Text>
              <Text className="mt-2 text-xs capitalize text-primary">{item.role}</Text>
            </Pressable>
          )}
          onEndReachedThreshold={0.35}
          onEndReached={() => {
            if (hasNextPage) void fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <Text className="py-6 text-center text-sm text-inkSoft">{t('common.loading')}</Text>
            ) : null
          }
          ListEmptyComponent={<Text className="py-16 text-center text-inkSoft">{t('common.emptyTitle')}</Text>}
        />
      )}

      <Modal transparent animationType="fade" visible={selected !== null} onRequestClose={() => setSelected(null)}>
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            className="absolute inset-0 bg-black/40"
            onPress={() => setSelected(null)}
          />
          <View className="mx-4 mb-12 rounded-3xl border border-border bg-surface px-5 py-6">
            <Text className="text-xl font-bold text-ink">{t('admin.userDetailTitle')}</Text>
            {selected ? (
              <View className="mt-6 gap-2">
                <Text className="text-base text-ink">{selected.name}</Text>
                <Text className="text-sm text-inkSoft">{selected.phone}</Text>
                <Text className="text-sm capitalize text-primary">{selected.role}</Text>
              </View>
            ) : null}
            <Text className="mt-8 text-sm leading-6 text-inkSoft">{t('admin.manageUserSoon')}</Text>
            <Pressable accessibilityRole="button" className="mt-8 rounded-xl bg-primary px-4 py-4" onPress={() => setSelected(null)}>
              <Text className="text-center text-base font-semibold text-white">{t('common.confirm')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
