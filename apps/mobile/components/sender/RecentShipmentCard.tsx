import type { Shipment } from '@tayralsaad/types';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { formatIQD } from '@tayralsaad/utils';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/lib/theme';

type RecentShipmentCardProps = {
  shipment: Shipment;
  locale: 'ar' | 'en';
  onPress: () => void;
};

function formatShipmentDate(value: string | undefined, locale: 'ar' | 'en'): string {
  if (!value) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-IQ' : 'en-IQ', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function RecentShipmentCard({ shipment, locale, onPress }: RecentShipmentCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const statusLabel = t(`status.${shipment.status}`);
  const summary = `${shipment.dropoff.area}, ${statusLabel}, ${formatIQD(shipment.pricing.total, locale)}`;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={summary} onPress={onPress}>
      <Card style={{ gap: theme.spacing.sm }}>
        <View style={styles.topRow}>
          <AppText variant="bodyBold">{shipment.dropoff.area}</AppText>
          <View style={[styles.chip, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.line }]}>
            <AppText variant="caption" color="primary">
              {t(`status.${shipment.status}`)}
            </AppText>
          </View>
        </View>
        <AppText variant="caption" color="inkMuted">
          {formatShipmentDate(shipment.createdAt, locale)} · {shipment.trackingCode}
        </AppText>
        <AppText variant="bodyBold" color="primary">
          {formatIQD(shipment.pricing.total, locale)}
        </AppText>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
