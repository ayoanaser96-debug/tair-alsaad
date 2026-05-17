import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { router } from 'expo-router';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { HttpApiError } from '@/lib/api';
import {
  driverKeys,
  fetchDriverMe,
  postApplyDriver,
  uploadShipmentPhoto,
} from '@/queries/driver';

type VehType = 'motorcycle' | 'car' | 'van';

export default function DriverApplyScreen() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();

  const [vehicleType, setVehicleType] = useState<VehType>('motorcycle');
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [urls, setUrls] = useState({
    idFrontUrl: '',
    idBackUrl: '',
    licenseUrl: '',
    vehicleRegUrl: '',
  });

  const mut = useMutation({
    mutationFn: postApplyDriver,
    onSuccess: async (d) => {
      qc.setQueryData(driverKeys.me(), d);
      try {
        const fresh = await fetchDriverMe();
        qc.setQueryData(driverKeys.me(), fresh);
      } catch {
        /* keep submitted cache */
      }
      Alert.alert('', t('driver.statusBadge.pending_review'), [
        { text: t('common.confirm'), onPress: () => router.back() },
      ]);
    },
    onError: (e: unknown) => {
      const msg =
        e instanceof HttpApiError ? (i18n.language.startsWith('en') ? e.messageEn : e.message) : String(e);
      Alert.alert(t('common.errorTitle'), msg ?? '');
    },
  });

  async function captureDocumentPhoto(): Promise<string | null> {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('common.errorTitle'), t('driver.cameraPermissionDenied'));
      return null;
    }
    const shot = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (shot.canceled || !shot.assets?.[0]?.uri) return null;
    return shot.assets[0].uri;
  }

  async function attach(key: keyof typeof urls) {
    const uri = await captureDocumentPhoto();
    if (!uri) return;
    try {
      const url = await uploadShipmentPhoto(uri);
      setUrls((u) => ({ ...u, [key]: url }));
    } catch (e: unknown) {
      const msg =
        e instanceof HttpApiError ? (i18n.language.startsWith('en') ? e.messageEn : e.message) : String(e);
      Alert.alert(t('common.errorTitle'), msg ?? '');
    }
  }

  const vehChip = (v: VehType, label: string) => {
    const on = vehicleType === v;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        onPress={() => setVehicleType(v)}
        className={`mr-3 rounded-full px-4 py-2 ${on ? 'bg-primary' : 'border border-border bg-surface'}`}
      >
        <Text className={`text-sm font-medium ${on ? 'text-[#EFE8DD]' : 'text-ink'}`}>{label}</Text>
      </Pressable>
    );
  };

  const ready =
    plate.trim().length >= 3 &&
    model.trim().length >= 2 &&
    color.trim().length >= 2 &&
    urls.idFrontUrl &&
    urls.idBackUrl &&
    urls.licenseUrl &&
    urls.vehicleRegUrl;

  return (
    <Screen className="pb-10" edges={['top']}>
      <AppHeader title={t('driver.applyTitle')} />
      <ScrollView className="flex-1 px-5 pb-24" keyboardShouldPersistTaps="handled">
        <Text className="mt-4 text-base text-inkSoft">{t('driver.applySubtitle')}</Text>

        <Text className="mt-10 text-lg font-semibold text-ink">{t('driver.vehicle')}</Text>
        <View className="mt-4 flex-row flex-wrap">
          {vehChip('motorcycle', t('driver.vehMotorcycle'))}
          {vehChip('car', t('driver.vehCar'))}
          {vehChip('van', t('driver.vehVan'))}
        </View>
        <TextInput
          className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-ink"
          placeholder={t('driver.plate')}
          value={plate}
          onChangeText={setPlate}
        />
        <TextInput
          className="mt-3 rounded-xl border border-border bg-surface px-4 py-3 text-ink"
          placeholder={t('driver.model')}
          value={model}
          onChangeText={setModel}
        />
        <TextInput
          className="mt-3 rounded-xl border border-border bg-surface px-4 py-3 text-ink"
          placeholder={t('driver.color')}
          value={color}
          onChangeText={setColor}
        />

        <Text className="mt-10 text-lg font-semibold text-ink">{t('driver.documents')}</Text>

        <Button variant="secondary" containerClassName="mt-3" onPress={() => void attach('idFrontUrl')}>
          {urls.idFrontUrl ? `✓ ${t('driver.docIdFront')}` : t('driver.docIdFront')}
        </Button>
        <Button variant="secondary" containerClassName="mt-3" onPress={() => void attach('idBackUrl')}>
          {urls.idBackUrl ? `✓ ${t('driver.docIdBack')}` : t('driver.docIdBack')}
        </Button>
        <Button variant="secondary" containerClassName="mt-3" onPress={() => void attach('licenseUrl')}>
          {urls.licenseUrl ? `✓ ${t('driver.docLicense')}` : t('driver.docLicense')}
        </Button>
        <Button variant="secondary" containerClassName="mt-3 mb-24" onPress={() => void attach('vehicleRegUrl')}>
          {urls.vehicleRegUrl ? `✓ ${t('driver.docVehicleReg')}` : t('driver.docVehicleReg')}
        </Button>
      </ScrollView>

      <View className="border-t border-border bg-bg px-5 pb-10 pt-4">
        <Button
          loading={mut.isPending}
          disabled={!ready || mut.isPending}
          onPress={() =>
            mut.mutate({
              vehicle: { type: vehicleType, plate: plate.trim(), model: model.trim(), color: color.trim() },
              documents: urls,
            })
          }
        >
          {t('driver.submitApplication')}
        </Button>
      </View>
    </Screen>
  );
}
