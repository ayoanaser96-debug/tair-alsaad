import { useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { Animated, Modal, Pressable, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import type { Shipment } from '@tayralsaad/types';
import { colors } from '@tayralsaad/tokens';
import { formatIQD } from '@tayralsaad/utils';
import i18next from 'i18next';

import type { Coord } from '@/components/shipment/ShipmentRouteMap';
import { ShipmentRouteMap } from '@/components/shipment/ShipmentRouteMap';
import { Button } from '@/components/ui/Button';

function iqLocale(): 'ar' | 'en' {
  return i18next.language.startsWith('en') ? 'en' : 'ar';
}

function shipmentCoords(shipment: Shipment): { pickup: Coord; dropoff: Coord } | null {
  const r = shipment as unknown as Record<string, unknown>;
  const pickup = r.pickup as { location?: Coord } | undefined;
  const dropoff = r.dropoff as { location?: Coord } | undefined;
  const pl = pickup?.location;
  const dl = dropoff?.location;
  if (
    !pl ||
    !dl ||
    typeof pl.lat !== 'number' ||
    typeof pl.lng !== 'number' ||
    typeof dl.lat !== 'number' ||
    typeof dl.lng !== 'number'
  ) {
    return null;
  }
  return { pickup: pl, dropoff: dl };
}

type Props = {
  visible: boolean;
  shipment: Shipment | null;
  secondsLeft: number;
  onAccept: () => void;
  onDecline: () => void;
};

export function IncomingOfferModal(props: Props) {
  const { visible, shipment, secondsLeft, onAccept, onDecline } = props;
  const { t } = useTranslation();
  const locale = iqLocale();
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shake, { toValue: 6, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -6, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 4, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 70, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shake, visible]);

  if (!shipment) return null;

  const coords = shipmentCoords(shipment);
  const ext = shipment as unknown as {
    package?: { type?: string; weightTier?: string };
    service?: string;
    pricing?: { driverPayout?: number };
  };
  const pkg = ext.package;
  const fragile = pkg?.type === 'fragile';
  const urgent = ext.service === 'express';

  const payout = ext.pricing?.driverPayout ?? 0;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onDecline}>
      <Pressable accessibilityRole="button" className="flex-1 justify-end bg-black/40" onPress={onDecline}>
        <Animated.View style={{ transform: [{ translateX: shake }] }}>
          <Pressable
            accessibilityRole="none"
            className="mx-4 mb-10 rounded-3xl border border-border bg-surface px-5 pb-8 pt-6"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="mb-4 flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase text-inkSoft">{shipment.trackingCode ?? ''}</Text>
                <Text className="mt-2 text-lg font-semibold text-ink">{t('driver.offerModalTitle')}</Text>
              </View>
              <View className="rounded-full bg-bg px-3 py-2">
                <Text className="text-xs font-semibold text-primary">{t('driver.offerCountdown', { seconds: secondsLeft })}</Text>
              </View>
            </View>

            <Text className="text-sm leading-6 text-inkSoft">
              {[pkg?.type ? t(`shipmentNew.pkgTypes.${pkg.type}`, pkg.type) : '', pkg?.weightTier ? t(`shipmentNew.weights.${pkg.weightTier}`) : '']
                .filter(Boolean)
                .join(' · ')}
            </Text>

            <View className="mt-3 flex-row flex-wrap gap-3">
              {fragile ? (
                <View className="rounded-full border border-border bg-bg px-3 py-1">
                  <Text className="text-xs font-semibold text-ink">{t('driver.offerFragile')}</Text>
                </View>
              ) : null}
              {urgent ? (
                <View className="rounded-full border border-primary bg-bg px-3 py-1">
                  <Text className="text-xs font-semibold text-ink">{t('driver.offerUrgent')}</Text>
                </View>
              ) : null}
            </View>

            {coords ? (
              <View className="mt-5 overflow-hidden rounded-2xl border border-border">
                <ShipmentRouteMap pickup={coords.pickup} dropoff={coords.dropoff} height={140} />
              </View>
            ) : (
              <View className="mt-5 items-center justify-center rounded-2xl border border-border bg-bg py-10">
                <Ionicons name="map-outline" size={28} color={colors.inkSoft} />
                <Text className="mt-3 text-center text-sm text-inkSoft">{t('driver.offerRouteFallback')}</Text>
              </View>
            )}

            <Text className="mt-5 text-xs uppercase text-inkSoft">{t('driver.offerEarningsLabel')}</Text>
            <Text className="mt-2 text-2xl font-bold text-primary">{formatIQD(payout, locale)}</Text>

            <View className="mt-8 flex-row gap-3">
              <Button variant="secondary" containerClassName="flex-1" onPress={onDecline}>
                {t('driver.offerDecline')}
              </Button>
              <Button containerClassName="flex-1" onPress={onAccept}>
                {t('driver.offerAccept')}
              </Button>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
