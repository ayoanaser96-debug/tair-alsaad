import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Pressable, RefreshControl, Switch, Text, View } from 'react-native';

import type { ServiceTier, Shipment } from '@tayralsaad/types';
import { colors } from '@tayralsaad/tokens';
import { formatIQD } from '@tayralsaad/utils';
import * as Location from 'expo-location';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import { IncomingOfferModal } from '@/components/driver/IncomingOfferModal';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useDriverRequestSocket } from '@/hooks/useDriverRequestSocket';
import { haversineKm } from '@/lib/geo';
import {
  driverMongoId,
  useActiveShipmentDriver,
  useDriverEarnings,
  useDriverFeed,
  useDriverMe,
  useDriverOnlineToggle,
} from '@/queries/driver';
import { mongoId as shipmentMongoId } from '@/queries/shipments';
import { useAuthStore } from '@/stores/authStore';

const MOCK_EARNINGS_TODAY_IQD = 4_500_000;

function serviceTierLabel(t: (k: string) => string, tier: ServiceTier): string {
  switch (tier) {
    case 'express':
      return t('shipment.tierExpress');
    case 'same_day':
      return t('shipment.tierSameDay');
    case 'scheduled':
      return t('shipment.tierScheduled');
    default:
      return t('shipment.tierStandard');
  }
}

function pkgLabel(t: (k: string, ...args: unknown[]) => string, shipment: Shipment): string {
  const ext = shipment as unknown as { package?: { type?: string; weightTier?: string } };
  const typ = ext.package?.type;
  const wt = ext.package?.weightTier;
  const bits = [
    typ ? String(t(`shipmentNew.pkgTypes.${typ}`, typ)) : '',
    wt ? String(t(`shipmentNew.weights.${wt}`)) : '',
  ].filter(Boolean);
  return bits.join(' · ');
}

function tripRouteLabel(shipment: Shipment): string {
  const ext = shipment as unknown as { pickup?: { area?: string }; dropoff?: { area?: string } };
  return [ext.pickup?.area ?? '', ext.dropoff?.area ?? ''].filter(Boolean).join(' → ');
}

export default function DriverRequestsScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'ar';
  const user = useAuthStore((s) => s.user);
  const senderAccount =
    String(user?.role ?? '')
      .toLowerCase()
      .trim() === 'sender';

  const { data: driver, isPending: dmPending, isError } = useDriverMe(true);
  const mongo = driver ? driverMongoId(driver) : null;
  const status = typeof driver?.status === 'string' ? driver.status : '';

  const { data: activeTrip } = useActiveShipmentDriver();
  const toggleOnline = useDriverOnlineToggle();

  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locDenied, setLocDenied] = useState(false);
  const [dismissedOffers, setDismissedOffers] = useState<Record<string, boolean>>({});
  const [offerSeconds, setOfferSeconds] = useState(25);

  const loadLoc = useCallback(async () => {
    const res = await Location.requestForegroundPermissionsAsync();
    if (res.status !== 'granted') {
      setLocDenied(true);
      return;
    }
    setLocDenied(false);
    try {
      const cur = await Location.getCurrentPositionAsync({});
      setLoc({ lat: cur.coords.latitude, lng: cur.coords.longitude });
    } catch {
      setLocDenied(true);
    }
  }, []);

  useEffect(() => {
    void loadLoc();
  }, [loadLoc]);

  const { data: feed = [], refetch: refetchFeed, isFetching } = useDriverFeed(loc?.lat ?? null, loc?.lng ?? null);

  useDriverRequestSocket(mongo, loc?.lat ?? null, loc?.lng ?? null);

  const listData = activeTrip ? [] : feed;
  const topOffer = listData[0];
  const offerId = topOffer ? shipmentMongoId(topOffer) : '';

  const isOnline = Boolean(driver?.isOnline);
  const canGoOnline = status === 'active';

  const applyGate = !dmPending && (isError || !driver);

  const { data: earnings } = useDriverEarnings(Boolean(driver) && !applyGate);

  const offerEligible = Boolean(
    driver && !applyGate && canGoOnline && isOnline && !activeTrip && topOffer && offerId && !dismissedOffers[offerId],
  );

  useEffect(() => {
    if (!offerEligible) return;
    setOfferSeconds(25);
    const id = setInterval(() => setOfferSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [offerEligible, offerId]);

  useEffect(() => {
    if (offerSeconds === 0 && offerEligible && offerId) {
      setDismissedOffers((p) => ({ ...p, [offerId]: true }));
    }
  }, [offerSeconds, offerEligible, offerId]);

  const onToggleOnline = (next: boolean) => {
    if (!mongo) return;
    if (!canGoOnline) {
      Alert.alert(t('common.errorTitle'), t('driver.notApprovedOnline'));
      return;
    }
    if (!loc && next) void loadLoc();
    toggleOnline.mutate(next, {
      onError: (e: unknown) =>
        Alert.alert(t('common.errorTitle'), String((e as Error)?.message ?? t('errors.UNKNOWN'))),
    });
  };

  const renderCard = useCallback(
    (item: Shipment) => (
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(`/(driver)/accept/${shipmentMongoId(item)}`)}
        className="mb-4 rounded-2xl border border-border bg-surface px-4 py-4"
      >
        <Text className="text-xs font-semibold uppercase text-inkSoft">{item.trackingCode}</Text>
        <Text className="mt-2 text-base font-semibold text-ink">{tripRouteLabel(item)}</Text>
        <Text className="mt-1 text-xs text-inkSoft">{pkgLabel(t, item)}</Text>
        <Text className="mt-0.5 text-xs text-inkSoft">{serviceTierLabel(t, item.service as ServiceTier)}</Text>
        <Text className="mt-1 text-xs text-inkSoft">
          {typeof item.pickup?.location?.lat === 'number' && typeof item.pickup?.location?.lng === 'number' && loc
            ? t('driver.kmAway', { km: haversineKm(loc, item.pickup.location).toFixed(1) })
            : null}
        </Text>
        <Text className="mt-4 text-xl font-semibold text-primary">
          {formatIQD(item.pricing?.driverPayout ?? 0, locale)}
        </Text>
      </Pressable>
    ),
    [loc, locale, t],
  );

  const badgeLabel =
    status === 'pending_review'
      ? t('driver.statusBadge.pending_review')
      : status === 'active'
        ? t('driver.statusBadge.active')
        : status === 'suspended'
          ? t('driver.statusBadge.suspended')
          : status === 'rejected'
            ? t('driver.statusBadge.rejected')
            : status;

  const completedTrips = useMemo(() => earnings?.recent?.slice(0, 8) ?? [], [earnings?.recent]);

  const declineOffer = () => {
    if (offerId) setDismissedOffers((p) => ({ ...p, [offerId]: true }));
  };

  const acceptOffer = () => {
    if (!topOffer) return;
    router.push(`/(driver)/accept/${offerId}`);
    declineOffer();
  };

  const activeExt = activeTrip as unknown as {
    pickup?: { area?: string };
    dropoff?: { area?: string };
    etaMinutes?: number;
    pricing?: { driverPayout?: number };
  };

  const activePayout =
    typeof activeExt.pricing?.driverPayout === 'number' ? Math.round(activeExt.pricing.driverPayout * 0.9) : 0;

  const listHeader = driver ? (
    <Fragment>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-semibold text-ink">{t('driver.dashboard.title')}</Text>
        {dmPending ? (
          <Text className="text-sm text-inkSoft">{t('common.loading')}</Text>
        ) : (
          <Switch
            value={isOnline}
            disabled={!canGoOnline || toggleOnline.isPending}
            onValueChange={(v) => {
              if (v && activeTrip) {
                Alert.alert(t('common.errorTitle'), t('driver.activeTripBlocked'));
                return;
              }
              onToggleOnline(v);
            }}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        )}
      </View>

      <Text className={`mb-2 text-sm ${isOnline ? 'font-semibold text-primary' : 'text-inkSoft'}`}>
        {isOnline ? t('driver.dashboard.lineOnline') : t('driver.dashboard.lineOffline')}
      </Text>
      <Text className="mb-4 rounded-xl bg-bg px-4 py-2 text-xs font-semibold text-ink">{badgeLabel}</Text>

      {!applyGate ? (
        <>
          <View className="mb-4 rounded-2xl border border-border bg-surface px-4 py-4">
            <Text className="text-xs uppercase text-inkSoft">{t('driver.dashboard.earningsToday')}</Text>
            <Text className="mt-2 text-2xl font-bold text-primary">{formatIQD(MOCK_EARNINGS_TODAY_IQD, locale)}</Text>
          </View>

          <View className="mb-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-border bg-bg px-3 py-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="star" size={18} color={colors.primary} />
                <Text className="text-base font-semibold text-ink">{t('driver.dashboard.statRating')}</Text>
              </View>
            </View>
            <View className="flex-1 rounded-2xl border border-border bg-bg px-3 py-3">
              <Text className="text-xs uppercase text-inkSoft">{t('driver.dashboard.statTrips')}</Text>
              <Text className="mt-2 text-lg font-bold text-ink">24</Text>
            </View>
            <View className="flex-1 rounded-2xl border border-border bg-bg px-3 py-3">
              <Text className="text-xs uppercase text-inkSoft">{t('driver.dashboard.statAccept')}</Text>
              <Text className="mt-2 text-lg font-bold text-ink">96%</Text>
            </View>
          </View>
        </>
      ) : null}

      {activeTrip ? (
        <View className="mb-6 rounded-2xl border border-primary bg-surface p-5">
          <Text className="text-sm font-semibold text-primary">{t('driver.activeTripBanner')}</Text>
          <Text className="mt-3 text-base font-semibold text-ink">{tripRouteLabel(activeTrip)}</Text>
          {typeof activeExt.etaMinutes === 'number' ? (
            <Text className="mt-2 text-sm text-inkSoft">{t('track.etaMinutes', { minutes: activeExt.etaMinutes })}</Text>
          ) : null}
          {activePayout > 0 ? (
            <Text className="mt-2 text-sm text-inkSoft">
              {t('driver.dashboard.activeEarningsCut', { amount: formatIQD(activePayout, locale) })}
            </Text>
          ) : null}
          <Button size="sm" containerClassName="mt-4" onPress={() => router.push('/(driver)/(tabs)/active')}>
            {t('navigation.active')}
          </Button>
        </View>
      ) : null}

      {locDenied ? (
        <View className="mb-4 rounded-2xl border border-border bg-bg p-5">
          <Text className="text-sm text-ink">{t('driver.locationNeeded')}</Text>
          <Button variant="secondary" containerClassName="mt-5" size="sm" onPress={() => void loadLoc()}>
            {t('driver.refreshLocation')}
          </Button>
        </View>
      ) : null}

      {driver.isOnline ? <Text className="mb-4 text-xs text-inkSoft">{t('driver.feedSubtitle')}</Text> : null}

      <Text className="mb-4 text-[11px] leading-5 text-inkSoft">{t('driver.locationPingNote')}</Text>

      {!applyGate ? (
        <>
          <Text className="mb-3 text-lg font-semibold text-ink">{t('driver.completedTripsTitle')}</Text>
          {completedTrips.length === 0 ? (
            <Text className="mb-8 text-sm text-inkSoft">{t('common.emptyTitle')}</Text>
          ) : (
            completedTrips.map((trip, idx) => (
              <Pressable
                key={`${trip.trackingCode}-${idx}`}
                accessibilityRole="button"
                className="mb-3 rounded-xl border border-border bg-bg px-4 py-3"
                onPress={() => router.push('/(driver)/(tabs)/active')}
              >
                <Text className="text-xs uppercase text-inkSoft">{trip.trackingCode}</Text>
                <Text className="mt-2 text-sm font-medium text-ink">{t(`status.${trip.status}`, trip.status)}</Text>
              </Pressable>
            ))
          )}
          <Text className="mb-4 text-lg font-semibold text-ink">{t('driver.openOffersTitle')}</Text>
        </>
      ) : null}
    </Fragment>
  ) : null;

  return (
    <Fragment>
      <Screen className="px-5 pt-8">
        {senderAccount ? (
          <View className="mb-4 rounded-xl border border-border bg-bg px-4 py-3">
            <Text className="text-sm leading-6 text-ink">{t('driver.senderShellBanner')}</Text>
          </View>
        ) : null}

        {applyGate ? (
          <View className="items-center gap-6 px-2 pt-20">
            <Text className="text-center text-xl font-semibold text-ink">{t('driver.applyGateTitle')}</Text>
            <Text className="max-w-sm text-center text-base text-inkSoft">{t('driver.applyGateSubtitle')}</Text>
            <Button onPress={() => router.push('/(driver)/apply')}>{t('driver.applyTitle')}</Button>
          </View>
        ) : driver ? (
          <FlatList
            data={listData}
            keyExtractor={(s) => shipmentMongoId(s)}
            renderItem={({ item }) => renderCard(item)}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetchFeed()} />}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={
              driver.isOnline && !activeTrip ? (
                <Text className="mt-16 text-center text-inkSoft">{t('common.emptyTitle')}</Text>
              ) : (
                <Text className="mt-16 text-center text-inkSoft">{t('driver.goOnline')}</Text>
              )
            }
          />
        ) : null}
      </Screen>

      <IncomingOfferModal
        visible={offerEligible && offerSeconds > 0}
        shipment={topOffer ?? null}
        secondsLeft={offerSeconds}
        onAccept={acceptOffer}
        onDecline={declineOffer}
      />
    </Fragment>
  );
}
