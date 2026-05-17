import { useTranslation } from 'react-i18next';

import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import * as Location from 'expo-location';
import { router } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { ShipmentRouteMap } from '@/components/shipment/ShipmentRouteMap';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useDebouncedShipmentQuote } from '@/hooks/useDebouncedShipmentQuote';
import { useMe } from '@/queries/me';
import { useDraftShipmentStore } from '@/stores/draftShipmentStore';

export default function NewShipmentPickupScreen() {
  const { t } = useTranslation();
  useDebouncedShipmentQuote();
  const { data: me } = useMe();

  const pickup = useDraftShipmentStore((s) => s.pickup);
  const patchPickup = useDraftShipmentStore((s) => s.patchPickup);
  const resetDraft = useDraftShipmentStore((s) => s.resetDraft);
  const applySavedAddressPickup = useDraftShipmentStore((s) => s.applySavedAddressPickup);

  async function askLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.errorTitle'), t('shipmentNew.permissionLocation'));
      return;
    }
    const cur = await Location.getCurrentPositionAsync({});
    patchPickup({
      location: {
        lat: cur.coords.latitude,
        lng: cur.coords.longitude,
      },
    });
  }

  return (
    <Screen edges={['top']}>
      <AppHeader
        title={t('shipmentNew.pickupTitle')}
        right={
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.replace('/(sender)/(tabs)')}>
            <Text className="text-sm font-semibold text-primary">{t('common.close')}</Text>
          </Pressable>
        }
        canGoBack={false}
      />
      <ScrollView className="flex-1 px-5 pb-28" keyboardShouldPersistTaps="handled">
        <Text className="mt-4 text-sm text-inkSoft">{t('shipmentNew.mapHint')}</Text>

        <View className="mt-4">
          <ShipmentRouteMap
            showRoute={false}
            pickup={pickup.location}
            dropoff={pickup.location}
            height={280}
            draggable="pickup"
            onMove={(_which, coord) => patchPickup({ location: coord })}
          />
        </View>

        <View className="mt-6 gap-4">
          <Button variant="secondary" size="sm" containerClassName="self-start px-6" onPress={() => askLocation()}>
            {t('shipmentNew.useLocation')}
          </Button>

          {me?.defaultAddresses?.length ? (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-ink">{t('shipmentNew.savedAddresses')}</Text>
              {me.defaultAddresses.map((addr, ix) => (
                <Pressable
                  key={addr.serverId ?? `${addr.city}-${addr.area}-${ix}`}
                  className="rounded-xl bg-surface px-4 py-3"
                  onPress={() =>
                    applySavedAddressPickup({
                      ...addr,
                      city: scrubCityStored(addr.city),
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
            value={pickup.city}
            onChangeText={(v) => patchPickup({ city: v })}
          />
          <Input
            label={t('shipmentNew.area')}
            value={pickup.area}
            onChangeText={(v) => patchPickup({ area: v })}
          />
          <Input label={t('shipmentNew.street')} value={pickup.street ?? ''} onChangeText={(v) => patchPickup({ street: v })} />
          <Input label={t('shipmentNew.building')} value={pickup.building ?? ''} onChangeText={(v) => patchPickup({ building: v })} />
          <Input label={t('shipmentNew.notes')} value={pickup.notes ?? ''} onChangeText={(v) => patchPickup({ notes: v })} />
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
        <Button containerClassName="w-full" onPress={() => router.push('/(sender)/new/dropoff')}>
          {t('common.next')}
        </Button>
      </View>
    </Screen>
  );
}

function scrubCityStored(city: string): string {
  return city.trim().toLowerCase();
}
