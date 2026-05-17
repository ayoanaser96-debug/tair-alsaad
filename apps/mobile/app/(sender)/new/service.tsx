import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { ServiceTier } from '@tayralsaad/types';

import { router } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useDebouncedShipmentQuote } from '@/hooks/useDebouncedShipmentQuote';
import { useDraftShipmentStore } from '@/stores/draftShipmentStore';

const TIERS: ServiceTier[] = ['standard', 'express', 'scheduled'];

function tw(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export default function NewShipmentServiceScreen() {
  const { t } = useTranslation();
  useDebouncedShipmentQuote();

  const service = useDraftShipmentStore((s) => s.service);
  const scheduledIso = useDraftShipmentStore((s) => s.scheduledForIso);
  const setService = useDraftShipmentStore((s) => s.setService);
  const resetDraft = useDraftShipmentStore((s) => s.resetDraft);

  const scheduledDate = useMemo(
    () => (scheduledIso ? new Date(scheduledIso) : new Date(Date.now() + 45 * 60_000)),
    [scheduledIso],
  );

  const [scheduledLocal, setScheduledLocal] = useState(scheduledDate);
  const [pickerShown, setPickerShown] = useState(Platform.OS === 'ios');

  const tierLabels: Record<ServiceTier, string> = {
    standard: t('shipment.tierStandard'),
    express: t('shipment.tierExpress'),
    scheduled: t('shipment.tierScheduled'),
  };

  function selectTier(next: ServiceTier) {
    if (next !== 'scheduled') {
      setService(next, null);
      return;
    }
    const iso = scheduledLocal.toISOString();
    setService(next, iso);
    if (Platform.OS === 'android') setPickerShown(true);
  }

  return (
    <Screen edges={['top']}>
      <AppHeader title={t('shipmentNew.serviceTitle')} />
      <ScrollView className="flex-1 px-5 pb-40">
        <View className="mt-8 gap-4">
          {TIERS.map((tier) => {
            const sel = service === tier;
            return (
              <Pressable
                key={tier}
                accessibilityRole="button"
                className={tw('rounded-xl border px-5 py-4', sel ? 'border-primary bg-surface' : 'border-border bg-bg')}
                onPress={() => selectTier(tier)}
              >
                <Text className={tw('text-lg', sel ? 'font-semibold text-primary' : 'font-medium text-ink')}>{tierLabels[tier]}</Text>
              </Pressable>
            );
          })}
        </View>

        {service === 'scheduled' ? (
          <View className="mt-10 gap-4">
            <Text className="text-sm font-semibold text-ink">{t('shipmentNew.scheduledFor')}</Text>

            {(Platform.OS === 'android' ? pickerShown : true) ? (
              <DateTimePicker
                value={scheduledLocal}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event: DateTimePickerEvent, picked?: Date) => {
                  if (Platform.OS === 'android') setPickerShown(false);
                  if (event.type === 'dismissed' || !picked) return;
                  setScheduledLocal(picked);
                  setService('scheduled', picked.toISOString());
                }}
              />
            ) : (
              <Button variant="secondary" size="sm" onPress={() => setPickerShown(true)}>
                {t('shipmentNew.scheduledFor')}
              </Button>
            )}
          </View>
        ) : null}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 gap-3 border-t border-border bg-bg px-5 py-4">
        <Button
          variant="ghost"
          size="sm"
          onPress={() =>
            Alert.alert(t('shipmentNew.discardConfirmTitle'), t('shipmentNew.discardConfirmBody'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('shipmentNew.cancelDraft'),
                style: 'destructive',
                onPress: () => {
                  resetDraft();
                  router.replace('/(sender)/(tabs)');
                },
              },
            ])
          }
        >
          {t('shipmentNew.cancelDraft')}
        </Button>
        <Button containerClassName="w-full" onPress={() => router.push('/(sender)/new/review')}>
          {t('common.next')}
        </Button>
      </View>
    </Screen>
  );
}
