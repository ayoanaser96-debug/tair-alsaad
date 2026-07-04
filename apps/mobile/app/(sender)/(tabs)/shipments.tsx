import { useCallback, useMemo, useState } from 'react';
import { FlatList, type ListRenderItem, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import type { ShipmentStatus } from '@tayralsaad/types';
import { formatIQD } from '@tayralsaad/utils';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { useTheme } from '@/lib/theme';
import { mongoId, useMyShipmentsInfinite } from '@/queries/shipments';

type Segment = 'active' | 'completed' | 'cancelled';

function segmentOf(status: ShipmentStatus): Segment {
  if (status === 'delivered') return 'completed';
  if (status === 'cancelled' || status === 'disputed') return 'cancelled';
  return 'active';
}

export default function SenderShipmentsTabScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'ar';

  const [segment, setSegment] = useState<Segment>('active');
  const { data, isPending, isError, isFetchingNextPage, fetchNextPage, hasNextPage, refetch, isRefetching } =
    useMyShipmentsInfinite();

  const flattened = data?.pages.flatMap((p) => p.items) ?? [];
  const visible = flattened.filter((s) => segmentOf(s.status as ShipmentStatus) === segment);

  const segments = useMemo(
    () =>
      ({
        active: t('shipmentNew.segmentActive'),
        completed: t('shipmentNew.segmentCompleted'),
        cancelled: t('shipmentNew.segmentCancelled'),
      }) satisfies Record<Segment, string>,
    [t],
  );

  const renderRow: ListRenderItem<(typeof visible)[number]> = useCallback(
    ({ item }) => {
      const sid = mongoId(item);
      const st = String(item.status ?? '');

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.trackingCode}, ${t(`status.${st}`, st)}`}
          onPress={() => router.push(`/(sender)/shipments/${sid}`)}
        >
          <Card style={{ marginBottom: theme.spacing.md, gap: theme.spacing.sm }}>
            <AppText variant="caption" color="inkMuted">
              {item.trackingCode}
            </AppText>
            <AppText variant="bodyBold">{t(`status.${st}`, st)}</AppText>
            <AppText variant="caption" color="inkMuted">
              {item.pickup.area} → {item.dropoff.area}
            </AppText>
            <AppText variant="title" color="primary">
              {formatIQD(item.pricing.total, locale)}
            </AppText>
          </Card>
        </Pressable>
      );
    },
    [locale, t, theme.spacing.md, theme.spacing.sm],
  );

  return (
    <ThemeScreen>
      <FlatList
        data={visible}
        keyExtractor={(s) => mongoId(s)}
        renderItem={renderRow}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xxxl + 88,
        }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.lg, marginBottom: theme.spacing.md }}>
            <AppText variant="title">{t('navigation.myShipments')}</AppText>
            <View style={styles.segmentRow}>
              {(Object.keys(segments) as Segment[]).map((key) => {
                const selected = segment === key;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={selected ? t('navigation.tabSelected', { label: segments[key] }) : segments[key]}
                    onPress={() => setSegment(key)}
                    style={[
                      styles.segment,
                      {
                        backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                        borderColor: selected ? theme.colors.primary : theme.colors.line,
                      },
                    ]}
                  >
                    <AppText variant="caption" color={selected ? 'white' : 'ink'} align="center">
                      {segments[key]}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          isError ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : isPending ? (
            <View style={{ gap: theme.spacing.md }}>
              <Skeleton height={96} radius={theme.radius.card} />
              <Skeleton height={96} radius={theme.radius.card} />
            </View>
          ) : (
            <EmptyState
              title={t('shipmentNew.listEmptyFiltered')}
              actionLabel={segment === 'active' ? t('sender.home.emptyAction') : undefined}
              onAction={segment === 'active' ? () => router.push('/(sender)/new') : undefined}
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <AppText variant="body" color="inkMuted" align="center" style={{ paddingVertical: theme.spacing.lg }}>
              {t('common.loading')}
            </AppText>
          ) : null
        }
        onEndReachedThreshold={0.3}
        onEndReached={() => {
          if (hasNextPage) void fetchNextPage();
        }}
      />
    </ThemeScreen>
  );
}

const styles = StyleSheet.create({
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
