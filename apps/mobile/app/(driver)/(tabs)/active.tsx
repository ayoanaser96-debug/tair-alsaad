import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Alert, Modal, ScrollView, Text, View } from 'react-native';

import { formatIQD } from '@tayralsaad/utils';
import i18next from 'i18next';

import * as ImagePicker from 'expo-image-picker';

import { Link } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { OtpDigits } from '@/components/driver/OtpDigits';
import { ShipmentRouteMap } from '@/components/shipment/ShipmentRouteMap';
import { StatusTimeline } from '@/components/shipment/StatusTimeline';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { HttpApiError } from '@/lib/api';
import {
  uploadShipmentPhoto,
  useActiveShipmentDriver,
  useShipmentDetailDriver,
} from '@/queries/driver';
import {
  useArrivedDropMutation,
  useArrivedPickupMutation,
  useConfirmDeliveryMutation,
  useConfirmPickupMutation,
} from '@/queries/driverTrip';
import { mongoId } from '@/queries/shipments';

function iqLocale(): 'ar' | 'en' {
  return i18next.language.startsWith('en') ? 'en' : 'ar';
}

type TripModal = null | 'pickup' | 'delivery';

export default function DriverActiveScreen() {
  const { t } = useTranslation();
  const locale = iqLocale();
  const { data: activeRef, isPending: loadRef } = useActiveShipmentDriver();

  const sid = activeRef ? mongoId(activeRef) : '';
  const { data: s, isPending: loadS, refetch } = useShipmentDetailDriver(sid);

  const arrivedP = useArrivedPickupMutation(sid);
  const confirmP = useConfirmPickupMutation(sid);
  const arrivedD = useArrivedDropMutation(sid);
  const confirmD = useConfirmDeliveryMutation(sid);

  const [modal, setModal] = useState<TripModal>(null);
  const [otp, setOtp] = useState('');
  const [pickupPhotoUri, setPickupPhotoUri] = useState<string | null>(null);
  const [deliveryPhotoUri, setDeliveryPhotoUri] = useState<string | null>(null);
  const [sigUri, setSigUri] = useState<string | null>(null);

  function closeTripModal() {
    setModal(null);
    setOtp('');
    setPickupPhotoUri(null);
    setDeliveryPhotoUri(null);
    setSigUri(null);
  }

  const primary = useMemo(() => {
    if (!s) return null;
    switch (s.status) {
      case 'assigned':
        return { key: 'arrP' as const };
      case 'arrived_pickup':
        return { key: 'pick' as const };
      case 'picked_up':
      case 'in_transit':
        return { key: 'arrD' as const };
      case 'arrived_dropoff':
        return { key: 'del' as const };
      default:
        return null;
    }
  }, [s]);

  async function pickPhoto(): Promise<string | null> {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('common.errorTitle'), t('driver.cameraPermissionDenied'));
      return null;
    }
    const shot = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (shot.canceled || !shot.assets?.[0]?.uri) return null;
    return shot.assets[0].uri;
  }

  async function runPickup() {
    if (!pickupPhotoUri || otp.length !== 4) return;
    try {
      const photoUrl = await uploadShipmentPhoto(pickupPhotoUri);
      await confirmP.mutateAsync({ otp, photoUrl });
      closeTripModal();
    } catch (e: unknown) {
      const msg = e instanceof HttpApiError ? (locale === 'en' ? e.messageEn : e.message) : t('errors.UNKNOWN');
      Alert.alert(t('common.errorTitle'), msg ?? '');
    }
  }

  async function capturePickupPhoto() {
    const uri = await pickPhoto();
    if (uri) setPickupPhotoUri(uri);
  }

  async function captureDeliveryPhoto() {
    const uri = await pickPhoto();
    if (uri) setDeliveryPhotoUri(uri);
  }

  async function runDelivery() {
    if (!deliveryPhotoUri || otp.length !== 4) return;
    try {
      const photoUrl = await uploadShipmentPhoto(deliveryPhotoUri);
      let signatureUrl: string | undefined;
      if (sigUri) signatureUrl = await uploadShipmentPhoto(sigUri);
      await confirmD.mutateAsync({ otp, photoUrl, ...(signatureUrl ? { signatureUrl } : {}) });
      closeTripModal();
    } catch (e: unknown) {
      const msg = e instanceof HttpApiError ? (locale === 'en' ? e.messageEn : e.message) : t('errors.UNKNOWN');
      Alert.alert(t('common.errorTitle'), msg ?? '');
    }
  }

  if (loadRef) {
    return (
      <Screen className="px-5 pt-8">
        <Text className="text-lg font-semibold text-ink">{t('navigation.active')}</Text>
        <Text className="mt-16 text-center text-inkSoft">{t('common.loading')}</Text>
      </Screen>
    );
  }

  if (!activeRef) {
    return (
      <Screen className="px-5 pt-8">
        <Text className="text-lg font-semibold text-ink">{t('navigation.active')}</Text>
        <Text className="mt-8 text-base text-inkSoft">{t('driver.noActiveTrip')}</Text>
        <Link href="/(driver)/(tabs)" style={{ alignSelf: 'flex-start', marginTop: 20 }}>
          <Text className="text-base font-semibold text-primary">{t('driver.openRequests')}</Text>
        </Link>
      </Screen>
    );
  }

  if (loadS || !s) {
    return (
      <Screen className="px-5 pt-8">
        <AppHeader title={t('navigation.active')} canGoBack={false} />
        <Text className="mt-8 text-center text-inkSoft">{t('common.loading')}</Text>
      </Screen>
    );
  }

  return (
    <Screen className="pb-6" edges={['top']}>
      <AppHeader title={t('navigation.active')} canGoBack={false} />

      <ScrollView className="flex-1 px-5">
        <Text className="mt-4 text-xs font-semibold text-inkSoft">{s.trackingCode}</Text>
        <Text className="mt-2 text-xl font-bold text-primary">{t(`status.${s.status}`)}</Text>
        <Text className="mt-6 text-2xl font-semibold text-ink">{formatIQD(s.pricing.driverPayout, locale)}</Text>

        <View className="mt-10">
          <ShipmentRouteMap
            pickup={s.pickup.location}
            dropoff={s.dropoff.location}
            height={320}
          />
        </View>

        <View className="mt-10">
          <Text className="mb-4 text-lg font-semibold text-ink">{t('shipment.history')}</Text>
          <StatusTimeline t={t} items={s.statusHistory.map((e) => ({ status: e.status, at: e.at }))} />
        </View>

        <View className="mt-12 gap-4 pb-32">
          {primary?.key === 'arrP' ? (
            <Button
              loading={arrivedP.isPending}
              onPress={() =>
                arrivedP.mutate(undefined, {
                  onError: (e: unknown) =>
                    Alert.alert(
                      t('common.errorTitle'),
                      e instanceof HttpApiError ? (locale === 'en' ? e.messageEn : e.message) : String(e),
                    ),
                })
              }
            >
              {t('driver.arrivedPickup')}
            </Button>
          ) : null}

          {primary?.key === 'pick' ? (
            <Button
              variant="secondary"
              onPress={() => {
                setOtp('');
                setPickupPhotoUri(null);
                setModal('pickup');
              }}
            >
              {t('driver.confirmPickup')}
            </Button>
          ) : null}

          {primary?.key === 'arrD' ? (
            <Button
              loading={arrivedD.isPending}
              onPress={() =>
                arrivedD.mutate(undefined, {
                  onError: (e: unknown) =>
                    Alert.alert(
                      t('common.errorTitle'),
                      e instanceof HttpApiError ? (locale === 'en' ? e.messageEn : e.message) : String(e),
                    ),
                })
              }
            >
              {t('driver.arrivedDrop')}
            </Button>
          ) : null}



          {primary?.key === 'del' ? (
            <Button
              variant="secondary"
              onPress={() => {
                setOtp('');
                setDeliveryPhotoUri(null);
                setSigUri(null);
                setModal('delivery');
              }}
            >
              {t('driver.confirmDelivery')}
            </Button>
          ) : null}

          <Button variant="ghost" size="sm" onPress={() => void refetch()}>
            {t('common.retry')}
          </Button>
        </View>
      </ScrollView>

      <Modal visible={modal === 'pickup'} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50 px-4 pb-10 pt-20">
          <View className="rounded-3xl bg-bg p-6">
            <Text className="text-lg font-semibold text-ink">{t('driver.enterOtpPickup')}</Text>
            <OtpDigits value={otp} onChange={setOtp} />
            <Button variant="secondary" containerClassName="mb-4" onPress={() => void capturePickupPhoto()}>
              {pickupPhotoUri ? `✓ ${t('driver.capturePhoto')}` : t('driver.capturePhoto')}
            </Button>
            <Button
              loading={confirmP.isPending}
              disabled={otp.length !== 4 || !pickupPhotoUri || confirmP.isPending}
              onPress={() => void runPickup()}
            >
              {t('common.confirm')}
            </Button>
            <Button variant="ghost" containerClassName="mt-3" onPress={closeTripModal}>
              {t('common.cancel')}
            </Button>
          </View>
        </View>
      </Modal>

      <Modal visible={modal === 'delivery'} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50 px-4 pb-10 pt-12">
          <ScrollView className="max-h-[80%] rounded-3xl bg-bg p-6">
            <Text className="text-lg font-semibold text-ink">{t('driver.enterOtpDrop')}</Text>
            <OtpDigits value={otp} onChange={setOtp} />
            <Button variant="secondary" containerClassName="mb-3" onPress={() => void captureDeliveryPhoto()}>
              {deliveryPhotoUri ? `✓ ${t('driver.capturePhoto')}` : t('driver.capturePhoto')}
            </Button>
            <Button
              variant="secondary"
              containerClassName="mb-3"
              onPress={async () => {
                const u = await pickPhoto();
                setSigUri(u);
              }}
            >
              {sigUri ? `✓ ${t('driver.signatureOptional')}` : t('driver.signatureOptional')}
            </Button>
            <Button
              loading={confirmD.isPending}
              disabled={otp.length !== 4 || !deliveryPhotoUri || confirmD.isPending}
              onPress={() => void runDelivery()}
            >
              {t('common.confirm')}
            </Button>
            <Button variant="ghost" containerClassName="mt-3" onPress={closeTripModal}>
              {t('common.cancel')}
            </Button>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}
