import { StyleSheet, View } from 'react-native';

import type { ShipmentPricing } from '@tayralsaad/types';
import { formatIQD } from '@tayralsaad/utils';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/lib/theme';

type ShipmentPriceBreakdownProps = {
  pricing: ShipmentPricing;
  locale: 'ar' | 'en';
};

export function ShipmentPriceBreakdown({ pricing, locale }: ShipmentPriceBreakdownProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card style={{ gap: theme.spacing.md }}>
      <AppText variant="bodyBold">{t('shipment.quote')}</AppText>
      <View style={styles.rows}>
        <PriceRow label={t('shipmentNew.pricingBase')} value={formatIQD(pricing.base, locale)} />
        <PriceRow label={t('shipmentNew.pricingDistance')} value={formatIQD(pricing.distance, locale)} />
        {pricing.surcharge > 0 ? (
          <PriceRow label={t('shipmentNew.pricingSurcharge')} value={formatIQD(pricing.surcharge, locale)} />
        ) : null}
        {pricing.surge > 0 ? (
          <PriceRow label={t('shipmentNew.pricingSurge')} value={formatIQD(pricing.surge, locale)} />
        ) : null}
      </View>
      <View style={[styles.totalRow, { borderTopColor: theme.colors.line, paddingTop: theme.spacing.md }]}>
        <AppText variant="bodyBold">{t('shipmentNew.pricingTotal')}</AppText>
        <AppText variant="title" color="primary">
          {formatIQD(pricing.total, locale)}
        </AppText>
      </View>
    </Card>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" color="inkMuted">
        {label}
      </AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
  },
});
