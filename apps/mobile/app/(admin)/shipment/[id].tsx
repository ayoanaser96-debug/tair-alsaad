import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { formatIQD } from '@tayralsaad/utils';
import { useLocalSearchParams } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { useTheme } from '@/lib/theme';
import { useShipmentDetail } from '@/queries/shipments';

export default function AdminShipmentDetailScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'ar';
  const { id } = useLocalSearchParams<{ id?: string }>();
  const shipmentId = typeof id === 'string' ? id : '';

  const { data: shipment, isPending, isError } = useShipmentDetail(shipmentId);

  const ext = shipment as unknown as Record<string, unknown> | undefined;
  const pickup = ext?.pickup as { city?: string; area?: string } | undefined;
  const dropoff = ext?.dropoff as { city?: string; area?: string } | undefined;
  const receiver = ext?.receiver as { name?: string; phone?: string } | undefined;
  const pricing = ext?.pricing as { total?: number; driverPayout?: number } | undefined;

  return (
    <ThemeScreen>
      <AppHeader title={t('admin.shipmentsTitle')} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: theme.spacing.xxxl,
          gap: theme.spacing.md,
        }}
      >
        {isPending ? <ActivityIndicator /> : null}
        {isError ? (
          <AppText variant="body" color="danger">
            {t('common.errorTitle')}
          </AppText>
        ) : null}
        {shipment ? (
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="title">{String(shipment.trackingCode ?? '—')}</AppText>
            <AppText variant="body" color="inkMuted">
              {t(`status.${String(shipment.status ?? '')}`, String(shipment.status ?? ''))}
            </AppText>
            <AppText variant="body">
              {[pickup?.city, pickup?.area].filter(Boolean).join(' · ')} →{' '}
              {[dropoff?.city, dropoff?.area].filter(Boolean).join(' · ')}
            </AppText>
            {receiver ? (
              <AppText variant="body" color="inkMuted" style={{ writingDirection: 'ltr' }}>
                {receiver.name ?? ''} · {receiver.phone ?? ''}
              </AppText>
            ) : null}
            <AppText variant="bodyBold" color="primary">
              {formatIQD(pricing?.total ?? 0, locale)}
            </AppText>
            {typeof pricing?.driverPayout === 'number' ? (
              <AppText variant="caption" color="inkMuted">
                {t('driver.earningsTotal')}: {formatIQD(pricing.driverPayout, locale)}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </ThemeScreen>
  );
}
