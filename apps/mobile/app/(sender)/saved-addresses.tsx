import { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';

import * as Location from 'expo-location';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { ShipmentRouteMap } from '@/components/shipment/ShipmentRouteMap';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useAddSavedAddressMutation, useDeleteSavedAddressMutation, useMe } from '@/queries/me';

const DEFAULT_CENTER = { lat: 33.3152, lng: 44.3661 };

export default function SavedAddressesScreen() {
  const { t } = useTranslation();
  const { data: me, isPending } = useMe();
  const addMut = useAddSavedAddressMutation();
  const delMut = useDeleteSavedAddressMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [city, setCity] = useState('baghdad');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [notes, setNotes] = useState('');
  const [loc, setLoc] = useState(DEFAULT_CENTER);

  const resetForm = useCallback(() => {
    setLabel('');
    setCity('baghdad');
    setArea('');
    setStreet('');
    setBuilding('');
    setNotes('');
    setLoc(DEFAULT_CENTER);
  }, []);

  async function fillGps() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.errorTitle'), t('shipmentNew.permissionLocation'));
      return;
    }
    const cur = await Location.getCurrentPositionAsync({});
    setLoc({ lat: cur.coords.latitude, lng: cur.coords.longitude });
  }

  async function submitAdd() {
    if (!city.trim() || !area.trim()) {
      Alert.alert(t('common.errorTitle'), '');
      return;
    }
    try {
      await addMut.mutateAsync({
        city: city.trim().toLowerCase(),
        area: area.trim(),
        location: loc,
        ...(label.trim() ? { label: label.trim() } : {}),
        ...(street.trim() ? { street: street.trim() } : {}),
        ...(building.trim() ? { building: building.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      Alert.alert('', t('shipmentNew.addressSaved'));
      setModalOpen(false);
      resetForm();
    } catch {
      Alert.alert(t('common.errorTitle'), t('errors.UNKNOWN'));
    }
  }

  const rows = me?.defaultAddresses ?? [];

  return (
    <Screen edges={['top']}>
      <AppHeader title={t('shipmentNew.addressesTitle')} />

      {isPending ? (
        <Text className="mt-12 text-center text-inkSoft">{t('common.loading')}</Text>
      ) : (
        <ScrollView className="flex-1 px-5 pb-28">
          <Text className="mt-6 text-sm text-inkSoft">{t('shipmentNew.addressesSubtitle')}</Text>

          <Button containerClassName="mt-8" variant="secondary" onPress={() => setModalOpen(true)}>
            {t('shipmentNew.addAddress')}
          </Button>

          {rows.length === 0 ? (
            <Text className="mt-16 text-center text-ink">{t('shipmentNew.addressNone')}</Text>
          ) : (
            <View className="mt-10 gap-4">
              {rows.map((addr) => (
                <View key={addr.serverId} className="rounded-2xl border border-border bg-surface px-4 py-4">
                  <Text className="text-base font-semibold text-ink">
                    {[addr.label, addr.city, addr.area].filter(Boolean).join(' · ') || `${addr.city} · ${addr.area}`}
                  </Text>
                  {addr.street ? <Text className="mt-2 text-xs text-inkSoft">{addr.street}</Text> : null}
                  <Button
                    containerClassName="mt-5"
                    variant="ghost"
                    size="sm"
                    loading={delMut.isPending}
                    onPress={() =>
                      Alert.alert(t('shipmentNew.addressDeleteTitle'), t('shipmentNew.addressDeleteBody'), [
                        { text: t('common.cancel'), style: 'cancel' },
                        {
                          text: t('common.delete'),
                          style: 'destructive',
                          onPress: () =>
                            void delMut.mutateAsync(addr.serverId).catch(() => Alert.alert(t('common.errorTitle'), t('errors.UNKNOWN'))),
                        },
                      ])
                    }
                  >
                    {t('common.delete')}
                  </Button>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={modalOpen} animationType="slide">
        <Screen edges={['top']}>
          <AppHeader
            title={t('shipmentNew.addAddress')}
            canGoBack={false}
            right={
              <Pressable accessibilityRole="button" hitSlop={10} onPress={() => setModalOpen(false)}>
                <Text className="text-sm font-semibold text-primary">{t('common.close')}</Text>
              </Pressable>
            }
          />
          <ScrollView className="flex-1 px-5 pb-24">
            <View className="mt-4">
              <ShipmentRouteMap
                showRoute={false}
                pickup={loc}
                dropoff={loc}
                height={220}
                draggable="pickup"
                onMove={(_which, coord) => setLoc(coord)}
              />
            </View>
            <Button containerClassName="mt-6" variant="secondary" size="sm" onPress={() => void fillGps()}>
              {t('shipmentNew.useLocation')}
            </Button>

            <View className="mt-10 gap-4">
              <Input label={t('shipmentNew.addressOptionalLabel')} value={label} onChangeText={setLabel} />
              <Input label={t('shipmentNew.city')} value={city} onChangeText={setCity} />
              <Input label={t('shipmentNew.area')} value={area} onChangeText={setArea} />
              <Input label={t('shipmentNew.street')} value={street} onChangeText={setStreet} />
              <Input label={t('shipmentNew.building')} value={building} onChangeText={setBuilding} />
              <Input label={t('shipmentNew.notes')} value={notes} onChangeText={setNotes} />
            </View>

            <Button containerClassName="mt-12" loading={addMut.isPending} onPress={() => void submitAdd()}>
              {t('common.save')}
            </Button>
          </ScrollView>
        </Screen>
      </Modal>
    </Screen>
  );
}
