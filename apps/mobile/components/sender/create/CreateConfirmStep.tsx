import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import type { PaymentMethod } from '@tayralsaad/types';
import { useTranslation } from 'react-i18next';

import { formatIQD } from '@tayralsaad/utils';
import i18next from 'i18next';

import { ShipmentRouteMap } from '@/components/shipment/ShipmentRouteMap';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/lib/theme';
import { useDraftShipmentStore } from '@/stores/draftShipmentStore';

const PAY: PaymentMethod[] = ['cash_on_delivery', 'zaincash', 'fastpay', 'fib', 'asia_hawala'];

function iqLocale(): 'ar' | 'en' {
  return i18next.language.startsWith('en') ? 'en' : 'ar';
}

export function CreateConfirmStep() {
  const theme = useTheme();
  const { t } = useTranslation();
  const locale = iqLocale();

  const draft = useDraftShipmentStore();
  const { pickup, dropoff, package: pkg, service, lastQuote, paymentMethod, setPaymentMethod } = draft;

  const payLabels = useMemo(
    () =>
      ({
        cash_on_delivery: t('shipmentNew.payCod'),
        zaincash: t('shipmentNew.payZaincash'),
        fastpay: t('shipmentNew.payFastpay'),
        fib: t('shipmentNew.payFib'),
        asia_hawala: t('shipmentNew.payHawala'),
      }) satisfies Record<PaymentMethod, string>,
    [t],
  );

  const tierLabels: Record<typeof service, string> = {
    standard: t('shipment.tierStandard'),
    express: t('shipment.tierExpress'),
    scheduled: t('shipment.tierScheduled'),
  };

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg, paddingBottom: 140 }}>
      <Card style={{ gap: theme.spacing.md }}>
        <ShipmentRouteMap pickup={pickup.location} dropoff={dropoff.location} height={160} showRoute pickupPinColor={theme.colors.primary} dropoffPinColor={theme.colors.accent} />
        <AppText variant="body">
          {pickup.area} → {dropoff.area}
        </AppText>
        <AppText variant="caption" color="inkMuted">
          {t(`shipmentNew.pkgTypes.${pkg.type}`)} · {tierLabels[service]}
        </AppText>
        {lastQuote ? (
          <AppText variant="title" color="primary">
            {formatIQD(lastQuote.pricing.total, locale)}
          </AppText>
        ) : null}
      </Card>

      <AppText variant="bodyBold">{t('shipmentNew.payment')}</AppText>
      <View style={{ gap: theme.spacing.sm }}>
        {PAY.map((method) => {
          const selected = paymentMethod === method;
          return (
            <Pressable key={method} accessibilityRole="button" onPress={() => setPaymentMethod(method)}>
              <Card
                style={{
                  borderWidth: 1.5,
                  borderColor: selected ? theme.colors.primary : theme.colors.line,
                }}
              >
                <AppText variant="body" color={selected ? 'primary' : 'ink'}>
                  {payLabels[method]}
                </AppText>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
