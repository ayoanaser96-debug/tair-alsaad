import { useTranslation } from 'react-i18next';

import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { router } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { ShipmentRouteMap } from '@/components/shipment/ShipmentRouteMap';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useDebouncedShipmentQuote } from '@/hooks/useDebouncedShipmentQuote';
import { useMe } from '@/queries/me';
import { useDraftShipmentStore } from '@/stores/draftShipmentStore';

export default function NewShipmentDropoffScreen() {
  const { t } = useTranslation();
  useDebouncedShipmentQuote();

  const { data: me } = useMe();
  const pickup = useDraftShipmentStore((s) => s.pickup);
  const dropoff = useDraftShipmentStore((s) => s.dropoff);
  const receiver = useDraftShipmentStore((s) => s.receiver);
  const patchDropoff = useDraftShipmentStore((s) => s.patchDropoff);
  const setReceiver = useDraftShipmentStore((s) => s.setReceiver);
  const resetDraft = useDraftShipmentStore((s) => s.resetDraft);
  const applySavedAddressDropoff = useDraftShipmentStore((s) => s.applySavedAddressDropoff);

  const canContinue = Boolean(dropoff.area.trim() && dropoff.city.trim() && receiver.name.trim() && receiver.phone.trim());

  return (
    <Screen edges={['top']}>
      <AppHeader title={t('shipmentNew.dropoffTitle')} />
      <ScrollView className="flex-1 px-5 pb-28">
        <Text className="mt-4 text-sm text-inkSoft">{t('shipmentNew.mapHint')}</Text>
        <View className="mt-4">
          <ShipmentRouteMap
            pickup={pickup.location}
            dropoff={dropoff.location}
            height={300}
            draggable="dropoff"
            onMove={(_which, coord) => patchDropoff({ location: coord })}
          />
        </View>

        <View className="mt-6 gap-4">
          {me?.defaultAddresses?.length ? (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-ink">{t('shipmentNew.savedAddresses')}</Text>
              {me.defaultAddresses.map((addr, ix) => (
                <Pressable
                  key={addr.serverId ?? `${addr.city}-${addr.area}-d-${ix}`}
                  className="rounded-xl bg-surface px-4 py-3"
                  onPress={() =>
                    applySavedAddressDropoff({
                      ...addr,
                      city: addr.city.trim().toLowerCase(),
                    })
                  }
                >
                  <Text className="text-sm font-semibold text-ink">
                    {[addr.city, addr.area].filter(Boolean).join(' · ')}
                  </Text>
                  {addr.street ? <Text className="mt-1 text-xs text-inkSoft">{addr.street}</Text> : null}
                </Pressable>
              ))}
            </View>
          ) : null}

          <Input
            label={t('shipmentNew.city')}
            value={dropoff.city}
            onChangeText={(v) => patchDropoff({ city: v })}
          />
          <Input
            label={t('shipmentNew.area')}
            value={dropoff.area}
            onChangeText={(v) => patchDropoff({ area: v })}
          />
          <Input label={t('shipmentNew.street')} value={dropoff.street ?? ''} onChangeText={(v) => patchDropoff({ street: v })} />
          <Input
            label={t('shipmentNew.building')}
            value={dropoff.building ?? ''}
            onChangeText={(v) => patchDropoff({ building: v })}
          />
          <Input label={t('shipmentNew.notes')} value={dropoff.notes ?? ''} onChangeText={(v) => patchDropoff({ notes: v })} />

          <Text className="mt-2 text-base font-semibold text-ink">{t('shipmentNew.receiverSection')}</Text>
          <Input
            label={t('shipment.receiver')}
            value={receiver.name}
            onChangeText={(name) => setReceiver({ ...receiver, name })}
          />
          <Input
            label={t('auth.phoneTitle')}
            keyboardType="phone-pad"
            value={receiver.phone}
            onChangeText={(phone) => setReceiver({ ...receiver, phone })}
          />
        </View>
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
        <Button disabled={!canContinue} containerClassName="w-full" onPress={() => router.push('/(sender)/new/package')}>
          {t('common.next')}
        </Button>
      </View>
    </Screen>
  );
}
