import type { Shipment, ShipmentStatus } from '@tayralsaad/types';
import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { formatIQD } from '@tayralsaad/utils';

import { ShipmentProgressBird } from '@/components/sender/ShipmentProgressBird';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ThemeButton } from '@/components/ui/ThemeButton';
import type { DriverAssignedPayload } from '@/hooks/useShipmentLiveChannel';
import { useTheme } from '@/lib/theme';

type ActiveShipmentCardProps = {
  shipment: Shipment;
  locale: 'ar' | 'en';
  driver?: DriverAssignedPayload['driver'] | null;
  etaMinutes?: number;
  onTrack: () => void;
};

function plainStatusKey(status: ShipmentStatus): string {
  if (status === 'in_transit' || status === 'arrived_dropoff') return 'sender.home.plainStatus.inTransit';
  if (status === 'picked_up' || status === 'arrived_pickup') return 'sender.home.plainStatus.pickedUp';
  if (status === 'assigned') return 'sender.home.plainStatus.assigned';
  if (status === 'pending') return 'sender.home.plainStatus.pending';
  return 'sender.home.plainStatus.default';
}

export function ActiveShipmentCard({ shipment, locale, driver, etaMinutes, onTrack }: ActiveShipmentCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const status = shipment.status as ShipmentStatus;
  const eta = typeof etaMinutes === 'number' ? etaMinutes : shipment.etaMinutes;

  const progressLabels = {
    created: t('sender.home.progress.created'),
    pickedUp: t('sender.home.progress.pickedUp'),
    inTransit: t('sender.home.progress.inTransit'),
    delivered: t('sender.home.progress.delivered'),
  };

  return (
    <Card
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${shipment.trackingCode}, ${t(plainStatusKey(status))}`}
      style={{ gap: theme.spacing.md }}
    >
      <AppText variant="caption" color="inkMuted">
        {shipment.trackingCode}
      </AppText>
      <AppText variant="title">{t(plainStatusKey(status))}</AppText>

      {driver ? (
        <View style={styles.driverRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceAlt }]}>
            <AppText variant="bodyBold" color="primary">
              {(driver.firstName ?? t('shipment.driver')).slice(0, 1)}
            </AppText>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="bodyBold">{driver.firstName ?? t('shipment.driver')}</AppText>
            <AppText variant="caption" color="inkMuted">
              {t('sender.home.courierRating', {
                rating: driver.rating?.average ?? 0,
                count: driver.rating?.count ?? 0,
              })}
            </AppText>
          </View>
        </View>
      ) : null}

      <ShipmentProgressBird status={status} labels={progressLabels} />

      <View style={styles.routeRow}>
        <AppText variant="body" color="inkMuted">
          {shipment.pickup.area} → {shipment.dropoff.area}
        </AppText>
        {typeof eta === 'number' ? (
          <AppText variant="caption" color="primary">
            {t('track.etaMinutes', { minutes: eta })}
          </AppText>
        ) : null}
      </View>

      <AppText variant="title" color="primary">
        {formatIQD(shipment.pricing.total, locale)}
      </AppText>

      <ThemeButton accessibilityLabel={t('sender.home.trackLive')} onPress={onTrack}>
        {t('sender.home.trackLive')}
      </ThemeButton>
    </Card>
  );
}

const styles = StyleSheet.create({
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeRow: {
    gap: 4,
  },
});
