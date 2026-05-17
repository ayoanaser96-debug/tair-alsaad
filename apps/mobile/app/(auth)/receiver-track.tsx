import { useCallback, useEffect, useMemo, useState } from 'react';

import type { PublicTrackingPayload } from '@tayralsaad/types';
import * as ExpoLinking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import Constants from 'expo-constants';
import { router } from 'expo-router';

import { BidiLtr } from '@/components/ui/Bidi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import type { DriverLocationEvt } from '@/hooks/usePublicShipmentRealtime';
import { usePublicShipmentRealtime } from '@/hooks/usePublicShipmentRealtime';
import { HttpApiError } from '@/lib/api';
import { usePublicTracking } from '@/queries/publicTrack';

function webOrigin(): string {
  const raw = Constants.expoConfig?.extra?.webPublicUrl as string | undefined;
  if (typeof raw === 'string' && /^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '');
  return 'http://localhost:5173';
}

function fitRegion(coords: Array<{ latitude: number; longitude: number }>) {
  if (!coords.length) {
    return {
      latitude: 33.3152,
      longitude: 44.3661,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };
  }
  let minLat = coords[0].latitude;
  let maxLat = coords[0].latitude;
  let minLng = coords[0].longitude;
  let maxLng = coords[0].longitude;
  for (const c of coords) {
    minLat = Math.min(minLat, c.latitude);
    maxLat = Math.max(maxLat, c.latitude);
    minLng = Math.min(minLng, c.longitude);
    maxLng = Math.max(maxLng, c.longitude);
  }
  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const latDelta = Math.max((maxLat - minLat) * 1.45, 0.06);
  const lngDelta = Math.max((maxLng - minLng) * 1.45, 0.06);
  return {
    latitude: midLat,
    longitude: midLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

function formatHistoryAt(raw: string | undefined, lng: string): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  try {
    return d.toLocaleString(lng.startsWith('en') ? 'en-IQ' : 'ar-IQ', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return d.toISOString();
  }
}

export default function ReceiverTrackScreen() {
  const { t, i18n } = useTranslation();
  const [draft, setDraft] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const normalized = submitted?.trim().toUpperCase() ?? '';

  const { data, isPending, isError, error, refetch, isFetching } = usePublicTracking(submitted, Boolean(submitted));

  const [driverSpot, setDriverSpot] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!data?.driverLocation) return;
    const lat = data.driverLocation.lat;
    const lng = data.driverLocation.lng;
    if (typeof lat === 'number' && Number.isFinite(lat) && typeof lng === 'number' && Number.isFinite(lng)) {
      setDriverSpot({ lat, lng });
    }
  }, [data?.driverLocation]);

  const onRefreshPayload = useCallback(() => void refetch(), [refetch]);

  const onDriverEvt = useCallback((p: DriverLocationEvt) => {
    setDriverSpot({ lat: p.lat, lng: p.lng });
  }, []);

  usePublicShipmentRealtime(normalized || null, data?.shipmentId ?? null, onRefreshPayload, onDriverEvt);

  const pickupCoord = useMemo(() => {
    const loc = data?.pickupLocation;
    if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return null;
    if (!Number.isFinite(loc.lat) || !Number.isFinite(loc.lng)) return null;
    return { latitude: loc.lat, longitude: loc.lng };
  }, [data?.pickupLocation]);

  const dropCoord = useMemo(() => {
    const loc = data?.dropoffLocation;
    if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return null;
    if (!Number.isFinite(loc.lat) || !Number.isFinite(loc.lng)) return null;
    return { latitude: loc.lat, longitude: loc.lng };
  }, [data?.dropoffLocation]);

  const driverCoord = useMemo(() => {
    if (!driverSpot) return null;
    return { latitude: driverSpot.lat, longitude: driverSpot.lng };
  }, [driverSpot]);

  const mapRegion = useMemo(() => {
    const pts: Array<{ latitude: number; longitude: number }> = [];
    if (pickupCoord) pts.push(pickupCoord);
    if (dropCoord) pts.push(dropCoord);
    if (driverCoord) pts.push(driverCoord);
    return fitRegion(pts);
  }, [pickupCoord, dropCoord, driverCoord]);

  const errorMessage = useMemo(() => {
    if (!isError || !error) return '';
    if (error instanceof HttpApiError) {
      return i18n.language.startsWith('en') ? error.messageEn : error.message;
    }
    return error instanceof Error ? error.message : t('track.errorLoad');
  }, [error, i18n.language, isError, t]);

  const submitCode = () => {
    const next = draft.trim().toUpperCase();
    if (next.length < 4) return;
    setSubmitted(next);
    setDriverSpot(null);
  };

  const openBrowser = async () => {
    if (normalized.length < 4) return;
    await ExpoLinking.openURL(`${webOrigin()}/track/${encodeURIComponent(normalized)}`);
  };

  const renderShipmentBody = (payload: PublicTrackingPayload) => (
    <>
      <View className="mb-4 rounded-2xl border border-border bg-surface px-4 py-4">
        <Text className="text-xs font-semibold uppercase text-inkSoft">{t('track.liveTitle')}</Text>
        <Text className="mt-2 capitalize text-xl font-semibold text-ink">{payload.status}</Text>
        {typeof payload.etaMinutes === 'number' ? (
          <Text className="mt-2 text-sm text-inkSoft">{t('track.etaMinutes', { minutes: payload.etaMinutes })}</Text>
        ) : null}
        {payload.receiver?.firstName ? (
          <Text className="mt-2 text-sm text-inkSoft">{payload.receiver.firstName}</Text>
        ) : null}
      </View>

      <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-surface">
        <MapView style={{ height: 240, width: '100%' }} region={mapRegion} rotateEnabled={false}>
          {pickupCoord ? (
            <Marker coordinate={pickupCoord} title={t('track.mapPickup')} description={payload.pickupCity ?? ''} />
          ) : null}
          {dropCoord ? (
            <Marker coordinate={dropCoord} title={t('track.mapDropoff')} description={payload.dropoffCity ?? ''} />
          ) : null}
          {driverCoord ? (
            <Marker coordinate={driverCoord} title={t('track.mapDriver')} description={t('track.liveTitle')} />
          ) : null}
        </MapView>
        {!driverCoord ? (
          <Text className="border-t border-border px-4 py-3 text-xs text-inkSoft">{t('track.driverPending')}</Text>
        ) : null}
      </View>

      <Text className="mb-2 text-base font-semibold text-ink">{t('track.updatesTitle')}</Text>
      {(payload.statusHistory ?? []).slice(0, 12).map((row, idx) => (
        <View
          key={`${idx}-${String(row.at)}-${row.status}`}
          className="mb-2 flex-row items-start justify-between gap-3 rounded-xl border border-border bg-bg px-3 py-2"
        >
          <Text className="flex-1 capitalize text-sm font-medium text-ink">{row.status}</Text>
          <Text className="max-w-[48%] text-end text-xs text-inkSoft">
            {formatHistoryAt(typeof row.at === 'string' ? row.at : String(row.at), i18n.language)}
          </Text>
        </View>
      ))}
    </>
  );

  return (
    <Screen className="flex-1 px-5 pt-6">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isFetching && Boolean(submitted)} onRefresh={() => void refetch()} />}
      >
        <Text className="mb-2 text-center text-2xl font-bold text-ink">{t('track.receiverTitle')}</Text>
        <Text className="mb-6 text-center text-sm text-inkSoft">{t('track.receiverHint')}</Text>

        <Input
          label={t('track.codeLabel')}
          value={draft}
          onChangeText={setDraft}
          autoCapitalize="characters"
          accessibilityLabel={t('track.codeLabel')}
        />

        <View className="mt-4 gap-3">
          <Button onPress={submitCode} disabled={draft.trim().length < 4}>
            {t('track.lookupAction')}
          </Button>
          <Button variant="secondary" onPress={() => void openBrowser()} disabled={normalized.length < 4}>
            {t('track.openBrowser')}
          </Button>
        </View>

        {normalized.length >= 4 ? (
          <BidiLtr text={normalized} className="mt-6 text-center text-sm font-semibold text-primary" />
        ) : null}

        <View className="mt-8 pb-16">
          {isPending && submitted ? (
            <View className="items-center py-10">
              <ActivityIndicator accessibilityLabel={t('common.loading')} />
              <Text className="mt-4 text-sm text-inkSoft">{t('common.loading')}</Text>
            </View>
          ) : null}

          {isError ? (
            <View className="rounded-2xl border border-danger bg-surface px-4 py-4">
              <Text className="text-sm text-danger">{errorMessage}</Text>
              <Button variant="secondary" containerClassName="mt-4" onPress={() => void refetch()}>
                {t('track.refresh')}
              </Button>
            </View>
          ) : null}

          {!isPending && data ? renderShipmentBody(data) : null}

          <Button variant="ghost" containerClassName="mt-10 mb-8" onPress={() => router.back()}>
            {t('common.back')}
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
