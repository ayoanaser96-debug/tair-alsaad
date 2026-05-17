import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Alert, Text, View } from 'react-native';

import { formatIQD } from '@tayralsaad/utils';
import i18next from 'i18next';

import { useLocalSearchParams, router } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { HttpApiError } from '@/lib/api';
import { useAcceptShipmentMutation, useShipmentDetailDriver } from '@/queries/driver';

const ACCEPT_SECONDS = 30;

function iqLocale(): 'ar' | 'en' {
  return i18next.language.startsWith('en') ? 'en' : 'ar';
}

export default function DriverAcceptScreen() {
  const { t } = useTranslation();
  const locale = iqLocale();
  const { id } = useLocalSearchParams<{ id: string }>();

  const shipmentId = typeof id === 'string' ? id : '';
  const { data: shipment, isPending, isError } = useShipmentDetailDriver(shipmentId);
  const accept = useAcceptShipmentMutation();

  const [secondsLeft, setSecondsLeft] = useState(ACCEPT_SECONDS);

  /** Full window for each shipment when opening accept or switching `[id]`. */
  useEffect(() => {
    setSecondsLeft(ACCEPT_SECONDS);
  }, [shipmentId]);

  const shipmentOpen = shipment?.status === 'pending';

  const canAccept = useMemo(() => {
    if (!shipment || !shipmentOpen || secondsLeft <= 0) return false;
    return true;
  }, [secondsLeft, shipment, shipmentOpen]);

  useEffect(() => {
    if (!shipmentOpen || !shipmentId) return;
    const iv = setInterval(() => setSecondsLeft((sec) => (sec <= 1 ? 0 : sec - 1)), 1000);
    return () => clearInterval(iv);
  }, [shipmentOpen, shipmentId]);

  const onExpire = useCallback(() => router.back(), []);

  useEffect(() => {
    if (secondsLeft !== 0 || !shipmentOpen) return;
    onExpire();
  }, [secondsLeft, shipmentOpen, onExpire]);

  if (!/^[a-f\d]{24}$/i.test(shipmentId)) {
    return (
      <Screen className="px-5 pt-8">
        <Text className="text-ink">{t('errors.NOT_FOUND')}</Text>
      </Screen>
    );
  }

  if (isPending) {
    return (
      <Screen className="px-5 pt-8">
        <Text className="text-inkSoft">{t('common.loading')}</Text>
      </Screen>
    );
  }

  if (isError || !shipment) {
    return (
      <Screen className="px-5 pt-8">
        <Text className="text-ink">{t('errors.NOT_FOUND')}</Text>
        <Button containerClassName="mt-8" onPress={() => router.back()}>
          {t('driver.decline')}
        </Button>
      </Screen>
    );
  }

  return (
    <Screen className="px-5 pb-8" edges={['top']}>
      <AppHeader title={t('driver.acceptShipment')} />

      {shipmentOpen ? (
        <View className="mt-4 self-start rounded-full bg-danger/10 px-4 py-2">
          <Text className="text-sm font-semibold text-danger">
            {t('driver.acceptExpires')}: {secondsLeft}s
          </Text>
        </View>
      ) : (
        <View className="mt-4 rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-base font-semibold text-ink">{t('errors.SHIPMENT_UNAVAILABLE')}</Text>
          <Text className="mt-2 text-sm text-inkSoft">{t(`status.${shipment.status}`)}</Text>
        </View>
      )}

      <Text className="mt-10 text-xs font-semibold uppercase text-inkSoft">{shipment.trackingCode}</Text>
      <Text className="mt-2 text-xl font-semibold text-ink">
        {[shipment.pickup?.area ?? '', shipment.dropoff?.area ?? ''].join(' → ')}
      </Text>
      <Text className="mt-10 text-3xl font-bold text-primary">{formatIQD(shipment.pricing.driverPayout, locale)}</Text>

      <View className="mt-auto gap-4 pt-16">
        <Button
          disabled={!canAccept || accept.isPending}
          loading={accept.isPending}
          onPress={() =>
            accept.mutate(shipmentId, {
              onSuccess: () => router.replace('/(driver)/(tabs)/active'),
              onError: (e: unknown) => {
                const msg =
                  e instanceof HttpApiError ? (locale === 'en' ? e.messageEn : e.message) : String(e);
                Alert.alert(t('common.errorTitle'), msg);
              },
            })
          }
        >
          {t('driver.acceptShipment')}
        </Button>
        <Button variant="ghost" onPress={() => router.back()} disabled={accept.isPending}>
          {t('driver.decline')}
        </Button>
      </View>
    </Screen>
  );
}
