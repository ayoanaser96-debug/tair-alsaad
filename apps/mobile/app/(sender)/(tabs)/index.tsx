import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { formatIQD } from '@tayralsaad/utils';

import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { mongoId, useMyShipmentsInfinite } from '@/queries/shipments';
import { useAuthStore } from '@/stores/authStore';

function isActivePipe(status: string): boolean {
  return !['delivered', 'cancelled', 'disputed'].includes(status);
}

export default function SenderHomeDashboardScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'ar';
  const user = useAuthStore((s) => s.user);

  const { data, isPending, isError } = useMyShipmentsInfinite();

  const flattened = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data?.pages]);
  const activeOnes = useMemo(
    () => flattened.filter((s) => isActivePipe(String(s.status ?? ''))).slice(0, 3),
    [flattened],
  );

  const recent = useMemo(() => flattened.slice(0, 5), [flattened]);

  const greetingName = typeof user?.name === 'string' && user.name.trim() ? user.name.trim() : t('sender.dashboard.guestName');

  return (
    <Screen className="flex-1 px-5 pb-28 pt-8">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-ink">{t('sender.dashboard.greeting', { name: greetingName })}</Text>

        <View className="mt-6 rounded-2xl border border-border bg-surface px-5 py-5">
          <Text className="text-xs uppercase text-inkSoft">{t('navigation.wallet')}</Text>
          <Text className="mt-3 text-3xl font-bold text-primary">{formatIQD(0, locale)}</Text>
        </View>

        <Text className="mt-10 text-lg font-semibold text-ink">{t('sender.dashboard.quickActions')}</Text>
        <View className="mt-4 flex-row flex-wrap justify-between gap-y-4">
          <Pressable
            accessibilityRole="button"
            className="w-[48%] rounded-2xl border border-border bg-bg px-4 py-5 active:opacity-80"
            onPress={() => router.push('/(sender)/new')}
          >
            <Text className="text-center text-sm font-semibold text-ink">{t('sender.dashboard.actionSend')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="w-[48%] rounded-2xl border border-border bg-bg px-4 py-5 active:opacity-80"
            onPress={() => router.push('/receiver-track')}
          >
            <Text className="text-center text-sm font-semibold text-ink">{t('sender.dashboard.actionTrack')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="w-[48%] rounded-2xl border border-border bg-bg px-4 py-5 active:opacity-80"
            onPress={() => router.push('/(sender)/history')}
          >
            <Text className="text-center text-sm font-semibold text-ink">{t('sender.dashboard.actionHistory')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="w-[48%] rounded-2xl border border-border bg-bg px-4 py-5 active:opacity-80"
            onPress={() => router.push('/(sender)/wallet')}
          >
            <Text className="text-center text-sm font-semibold text-ink">{t('navigation.wallet')}</Text>
          </Pressable>
        </View>

        <Text className="mt-10 text-lg font-semibold text-ink">{t('sender.dashboard.activeShipments')}</Text>
        {isPending ? (
          <Text className="mt-4 text-sm text-inkSoft">{t('common.loading')}</Text>
        ) : isError ? (
          <Text className="mt-4 text-sm text-danger">{t('common.errorTitle')}</Text>
        ) : activeOnes.length === 0 ? (
          <Text className="mt-4 text-sm text-inkSoft">{t('common.emptyTitle')}</Text>
        ) : (
          activeOnes.map((item) => {
            const sid = mongoId(item);
            const st = String(item.status ?? '');
            const ext = item as unknown as {
              pickup?: { area?: string };
              dropoff?: { area?: string };
              etaMinutes?: number;
              pricing?: { total?: number };
            };
            const eta = typeof ext.etaMinutes === 'number' ? ext.etaMinutes : undefined;
            const total = typeof ext.pricing?.total === 'number' ? ext.pricing.total : 0;

            return (
              <Pressable
                key={sid}
                accessibilityRole="button"
                className="mt-4 rounded-2xl border border-primary bg-surface px-4 py-4"
                onPress={() => router.push(`/(sender)/shipments/${sid}`)}
              >
                <Text className="text-xs font-semibold uppercase text-inkSoft">{item.trackingCode}</Text>
                <Text className="mt-3 text-base font-semibold text-ink">{t(`status.${st}`, st)}</Text>
                <Text className="mt-2 text-xs text-inkSoft">
                  {ext.pickup?.area ?? ''} → {ext.dropoff?.area ?? ''}
                </Text>
                {typeof eta === 'number' ? (
                  <Text className="mt-2 text-xs font-semibold text-primary">{t('track.etaMinutes', { minutes: eta })}</Text>
                ) : null}
                <Text className="mt-4 text-lg font-semibold text-primary">{formatIQD(total, locale)}</Text>
              </Pressable>
            );
          })
        )}

        <Text className="mt-10 text-lg font-semibold text-ink">{t('sender.dashboard.recentShipments')}</Text>
        {recent.length === 0 && !isPending ? (
          <Text className="mt-4 text-sm text-inkSoft">{t('common.emptyTitle')}</Text>
        ) : (
          recent.map((item) => {
            const sid = mongoId(item);
            const st = String(item.status ?? '');

            return (
              <Pressable
                key={`${sid}-recent`}
                accessibilityRole="button"
                className="mt-4 rounded-2xl border border-border bg-bg px-4 py-4 active:opacity-80"
                onPress={() => router.push(`/(sender)/shipments/${sid}`)}
              >
                <Text className="text-xs font-semibold uppercase text-inkSoft">{item.trackingCode}</Text>
                <Text className="mt-2 text-sm font-semibold text-ink">{t(`status.${st}`, st)}</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}
