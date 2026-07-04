import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ActiveShipmentCard } from '@/components/sender/ActiveShipmentCard';
import { RecentShipmentCard } from '@/components/sender/RecentShipmentCard';
import { SenderHomeSkeleton } from '@/components/sender/SenderHomeSkeleton';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import type { DriverAssignedPayload } from '@/hooks/useShipmentLiveChannel';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useShipmentLiveChannel } from '@/hooks/useShipmentLiveChannel';
import { useTheme } from '@/lib/theme';
import { useMe } from '@/queries/me';
import { mongoId, useMyShipmentsInfinite, useShipmentDetail } from '@/queries/shipments';
import { useAuthStore } from '@/stores/authStore';

function isActivePipe(status: string): boolean {
  return !['delivered', 'cancelled', 'disputed'].includes(status);
}

function firstName(name: string | undefined, fallback: string): string {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed) return fallback;
  return trimmed.split(/\s+/)[0] ?? fallback;
}

export default function SenderHomeDashboardScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'ar';
  const reduced = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const { data: me } = useMe();

  const { data, isPending, isError, refetch, isRefetching } = useMyShipmentsInfinite();

  const flattened = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data?.pages]);
  const heroListItem = useMemo(
    () => flattened.find((s) => isActivePipe(String(s.status ?? ''))),
    [flattened],
  );
  const heroId = heroListItem ? mongoId(heroListItem) : '';
  const { data: heroDetail } = useShipmentDetail(heroId || null);
  const hero = heroDetail ?? heroListItem;

  const recent = useMemo(() => flattened.slice(0, 3), [flattened]);

  const [liveDriver, setLiveDriver] = useState<DriverAssignedPayload['driver'] | null>(null);
  const [liveEta, setLiveEta] = useState<number | undefined>(undefined);

  useEffect(() => {
    setLiveDriver(null);
    setLiveEta(undefined);
  }, [heroId]);

  const onAssigned = useCallback((payload: DriverAssignedPayload) => {
    setLiveDriver(payload.driver);
  }, []);

  const onDriverMove = useCallback(() => undefined, []);
  const onEta = useCallback((etaMinutes: number) => {
    setLiveEta(etaMinutes);
  }, []);

  useShipmentLiveChannel(hero?.trackingCode, heroId || null, onAssigned, onDriverMove, onEta);

  const greetingName = firstName(user?.name, t('sender.dashboard.guestName'));
  const locationLabel = useMemo(() => {
    const addr = me?.defaultAddresses?.[0];
    if (addr?.city && addr?.area) return `${addr.area} · ${addr.city}`;
    return t('sender.home.defaultLocation');
  }, [me?.defaultAddresses, t]);

  const showEmpty = !isPending && !isError && flattened.length === 0;
  const contentEntering = reduced ? undefined : FadeIn.duration(280);

  return (
    <ThemeScreen>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xxxl + 88,
          gap: theme.spacing.xl,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <AppText variant="title">{t('sender.home.greeting', { name: greetingName })}</AppText>
            <AppText variant="body" color="inkMuted">
              {locationLabel}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('navigation.myAccount')}
            onPress={() => router.push('/(sender)/(tabs)/profile')}
            style={[styles.avatarBtn, { borderColor: theme.colors.line, backgroundColor: theme.colors.surface }]}
          >
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <AppText variant="bodyBold" color="primary">
                {greetingName.slice(0, 1)}
              </AppText>
            )}
          </Pressable>
        </View>

        {isPending ? <SenderHomeSkeleton /> : null}

        {isError ? <ErrorState onRetry={() => void refetch()} /> : null}

        {showEmpty ? (
          <EmptyState
            title={t('sender.home.emptyTitle')}
            subtitle={t('sender.home.emptySubtitle')}
            actionLabel={t('sender.home.emptyAction')}
            onAction={() => router.push('/(sender)/new')}
          />
        ) : null}

        {!isPending && !isError && hero ? (
          <Animated.View entering={contentEntering}>
            <ActiveShipmentCard
              shipment={hero}
              locale={locale}
              driver={liveDriver}
              etaMinutes={liveEta}
              onTrack={() => router.push(`/(sender)/shipments/${heroId}`)}
            />
          </Animated.View>
        ) : null}

        {!isPending && !isError && flattened.length > 0 ? (
          <Animated.View entering={contentEntering} style={{ gap: theme.spacing.xl }}>
            <View style={styles.quickActions}>
              <QuickAction label={t('sender.home.actionSend')} onPress={() => router.push('/(sender)/new')} primary />
              <QuickAction label={t('sender.home.actionEstimate')} onPress={() => router.push('/(sender)/new')} />
              <QuickAction
                label={t('sender.home.actionAddresses')}
                onPress={() => router.push('/(sender)/saved-addresses')}
              />
            </View>

            <View style={styles.sectionHeader}>
              <AppText variant="title">{t('sender.dashboard.recentShipments')}</AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('sender.home.viewAll')}
                onPress={() => router.push('/(sender)/(tabs)/shipments')}
                style={{ minHeight: 48, justifyContent: 'center' }}
              >
                <AppText variant="body" color="primary">
                  {t('sender.home.viewAll')}
                </AppText>
              </Pressable>
            </View>

            <View style={{ gap: theme.spacing.md }}>
              {recent.map((item) => {
                const sid = mongoId(item);
                return (
                  <RecentShipmentCard
                    key={sid}
                    shipment={item}
                    locale={locale}
                    onPress={() => router.push(`/(sender)/shipments/${sid}`)}
                  />
                );
              })}
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>
    </ThemeScreen>
  );
}

function QuickAction({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.quickAction,
        {
          backgroundColor: primary ? theme.colors.primary : theme.colors.surface,
          borderColor: primary ? theme.colors.primary : theme.colors.line,
        },
      ]}
    >
      <AppText variant="caption" color={primary ? 'white' : 'ink'} align="center">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    flex: 1,
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
