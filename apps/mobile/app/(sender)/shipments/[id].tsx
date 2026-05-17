import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import type { ShipmentStatus } from '@tayralsaad/types';

import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import Ionicons from '@expo/vector-icons/Ionicons';
import { formatIQD } from '@tayralsaad/utils';
import i18next from 'i18next';
import { router, useLocalSearchParams } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { ShipmentRouteMap } from '@/components/shipment/ShipmentRouteMap';
import { StatusTimeline } from '@/components/shipment/StatusTimeline';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useShipmentLiveChannel } from '@/hooks/useShipmentLiveChannel';
import type { DriverAssignedPayload } from '@/hooks/useShipmentLiveChannel';
import { HttpApiError } from '@/lib/api';
import { uploadShipmentPhoto } from '@/queries/driver';
import {
  mongoId,
  useCancelShipmentMutation,
  useDisputeShipmentMutation,
  useRateShipmentMutation,
  useShipmentDetail,
} from '@/queries/shipments';

type DriverCardPayload = DriverAssignedPayload['driver'];

function iqLocale(): 'ar' | 'en' {
  return i18next.language.startsWith('en') ? 'en' : 'ar';
}

function canCancel(senderStatus: ShipmentStatus): boolean {
  return senderStatus === 'pending' || senderStatus === 'assigned';
}

function shipmentAllowsDispute(st: ShipmentStatus): boolean {
  return !(st === 'delivered' || st === 'cancelled' || st === 'disputed');
}

export default function SenderShipmentDetailScreen() {
  const { t } = useTranslation();
  const locale = iqLocale();

  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] ?? '' : '';

  const { data: shipment, isPending } = useShipmentDetail(rawId);
  const sid = shipment ? mongoId(shipment) : rawId;

  const [reasonOpen, setReasonOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [driverPin, setDriverPin] = useState<{ lat: number; lng: number } | null>(null);
  const [liveDriverCard, setLiveDriverCard] = useState<DriverCardPayload | null>(null);
  const [liveEta, setLiveEta] = useState<number | undefined>(undefined);

  const tracking = shipment?.trackingCode ?? '';

  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputePhotoUrl, setDisputePhotoUrl] = useState<string | null>(null);
  const [disputePhotoBusy, setDisputePhotoBusy] = useState(false);

  useEffect(() => {
    setLiveEta(undefined);
    setDriverPin(null);
    setLiveDriverCard(null);
    setDisputeOpen(false);
    setDisputeReason('');
    setDisputePhotoUrl(null);
    setDisputePhotoBusy(false);
  }, [rawId]);

  const onAssigned = useCallback((p: DriverAssignedPayload) => {
    if (p.driver) setLiveDriverCard(p.driver);
  }, []);

  const onMove = useCallback((lat: number, lng: number) => {
    setDriverPin({ lat, lng });
  }, []);

  const onEta = useCallback((minutes: number) => {
    setLiveEta(minutes);
  }, []);

  useShipmentLiveChannel(tracking, sid, onAssigned, onMove, onEta);

  const cancelMut = useCancelShipmentMutation(sid);
  const rateMut = useRateShipmentMutation(sid);

  const disputeMut = useDisputeShipmentMutation(sid);

  const [rateStars, setRateStars] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [rateComment, setRateComment] = useState('');

  useEffect(() => {
    setRateStars(null);
    setRateComment('');
  }, [rawId]);

  const etaExt = shipment as unknown as { etaMinutes?: number } | undefined;
  const etaLabel =
    typeof liveEta === 'number' ? liveEta : typeof etaExt?.etaMinutes === 'number' ? etaExt.etaMinutes : undefined;

  const cancelDisabled = shipment ? !canCancel(shipment.status) : true;

  return (
    <Screen edges={['top']}>
      <AppHeader title={t('shipment.track')} />

      {isPending || !shipment ? (
        <Text className="mt-24 text-center text-inkSoft">{t('common.loading')}</Text>
      ) : (
        <ScrollView className="flex-1 px-5 pb-10">
          <View className="mt-4 rounded-3xl bg-surface px-4 py-5 shadow-sm shadow-border">
            <Text className="text-xs font-semibold text-inkSoft">{tracking}</Text>
            <Text className="mt-2 text-2xl font-bold text-primary">{t(`status.${shipment.status}`)}</Text>
            {typeof etaLabel === 'number' ? (
              <Text className="mt-2 text-sm text-inkSoft">{t('shipmentNew.etaMinutes', { minutes: etaLabel })}</Text>
            ) : null}
          </View>

          {shipment.status === 'disputed' ? (
            <View className="mt-6 rounded-2xl border border-danger/50 bg-danger/10 px-4 py-4">
              <Text className="font-semibold text-danger">{t('shipmentNew.disputedBanner')}</Text>
              {(shipment as { dispute?: { reason?: string } }).dispute?.reason ? (
                <Text className="mt-2 text-sm text-ink">
                  {t('shipmentNew.disputeReasonLabel')}: {(shipment as { dispute?: { reason?: string } }).dispute?.reason}
                </Text>
              ) : null}
            </View>
          ) : null}

          <Text className="mt-10 text-xl font-semibold text-ink">{formatIQD(shipment.pricing.total, locale)}</Text>

          <View className="mt-10">
            <ShipmentRouteMap
              pickup={shipment.pickup.location}
              dropoff={shipment.dropoff.location}
              driver={driverPin}
              height={360}
              showRoute
            />
          </View>

          {liveDriverCard ? (
            <View className="mt-8 flex-row gap-4 rounded-2xl border border-border bg-surface p-5">
              {liveDriverCard.photoUrl ? (
                <Image source={{ uri: liveDriverCard.photoUrl }} className="h-14 w-14 rounded-full bg-border" />
              ) : (
                <View className="h-14 w-14 items-center justify-center rounded-full bg-bg">
                  <Ionicons name="person-outline" size={26} color="#2F4A5C" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-base font-semibold text-ink">{liveDriverCard.firstName ?? t('shipment.driver')}</Text>
                {liveDriverCard.vehicle ? (
                  <Text className="mt-2 text-xs text-inkSoft">
                    {liveDriverCard.vehicle.type ?? ''}
                    {liveDriverCard.vehicle.plate ? ` · ${liveDriverCard.vehicle.plate}` : ''}
                  </Text>
                ) : null}
                <Text className="mt-3 text-xs text-inkSoft">
                  ⭐ {liveDriverCard.rating?.average ?? 0} ({liveDriverCard.rating?.count ?? 0})
                </Text>
              </View>
              {driverPin ? (
                <Text className="self-start text-[10px] font-semibold uppercase text-primary">{t('shipmentNew.driverLive')}</Text>
              ) : null}
            </View>
          ) : null}

          <View className="mt-12">
            <Text className="mb-6 text-xl font-semibold text-ink">{t('shipment.history')}</Text>
            <StatusTimeline t={t} items={shipment.statusHistory.map((entry) => ({ status: entry.status, at: entry.at }))} />
          </View>

          {shipmentAllowsDispute(shipment.status) ? (
            <View className="mt-12 rounded-2xl border border-border bg-surface px-4 py-5">
              <Text className="text-lg font-semibold text-ink">{t('shipmentNew.disputeTitle')}</Text>
              <Text className="mt-2 text-sm text-inkSoft">{t('shipmentNew.disputeExplain')}</Text>
              <Button variant="secondary" containerClassName="mt-5" onPress={() => setDisputeOpen(true)}>
                {t('shipmentNew.disputeTitle')}
              </Button>
            </View>
          ) : null}

          {shipment.status === 'delivered' ? (
            shipment.rating ? (
              <View className="mt-12 rounded-2xl border border-primary/40 bg-bg px-4 py-5">
                <Text className="text-sm font-semibold text-primary">{t('sender.yourRating')}</Text>
                <Text className="mt-2 text-lg text-ink">
                  {'★'.repeat(shipment.rating.stars)}
                  {'☆'.repeat(5 - shipment.rating.stars)}
                </Text>
                {shipment.rating.comment ? <Text className="mt-3 text-sm text-inkSoft">{shipment.rating.comment}</Text> : null}
              </View>
            ) : (
              <View className="mt-12 rounded-2xl border border-border bg-surface px-4 py-5">
                <Text className="text-lg font-semibold text-ink">{t('sender.rateDriverTitle')}</Text>
                <Text className="mt-2 text-sm text-inkSoft">{t('sender.rateStars')}</Text>
                <View className="mt-4 flex-row flex-wrap gap-2">
                  {([1, 2, 3, 4, 5] as const).map((n) => {
                    const sel = rateStars === n;
                    return (
                      <Pressable
                        key={n}
                        accessibilityRole="button"
                        onPress={() => setRateStars(n)}
                        className={sel ? 'rounded-full bg-primary px-4 py-3' : 'rounded-full border border-border bg-bg px-4 py-3'}
                      >
                        <Text className={sel ? 'font-bold text-white' : 'font-semibold text-ink'}>{n}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text className="mt-6 text-sm font-medium text-inkSoft">{t('sender.rateComment')}</Text>
                <TextInput
                  value={rateComment}
                  onChangeText={setRateComment}
                  placeholderTextColor="#5C544A"
                  className="mt-2 min-h-[80px] rounded-xl border border-border bg-bg p-3 text-base text-ink"
                  multiline
                />
                <Button
                  containerClassName="mt-5"
                  loading={rateMut.isPending}
                  disabled={rateStars === null || rateMut.isPending}
                  onPress={async () => {
                    if (!rateStars) return;
                    try {
                      await rateMut.mutateAsync({ stars: rateStars, comment: rateComment.trim() || undefined });
                      setRateComment('');
                      setRateStars(null);
                    } catch (e: unknown) {
                      let msg = t('errors.UNKNOWN');
                      if (e instanceof HttpApiError) msg = (locale === 'en' ? e.messageEn : e.message) ?? e.messageEn;
                      Alert.alert(t('common.errorTitle'), msg);
                    }
                  }}
                >
                  {t('sender.submitRating')}
                </Button>
              </View>
            )
          ) : null}

          {!cancelDisabled ? (
            <View className="mt-14">
              <Button variant="danger" onPress={() => setReasonOpen(true)}>
                {t('shipmentNew.cancelShipment')}
              </Button>
            </View>
          ) : (
            <Text className="mt-14 text-center text-sm text-inkSoft">{t('shipmentNew.cancelForbidden')}</Text>
          )}
        </ScrollView>
      )}

      <Modal visible={reasonOpen} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/45 px-5">
          <View className="w-full rounded-3xl bg-bg p-6">
            <Text className="text-lg font-semibold text-ink">{t('shipmentNew.cancelReason')}</Text>
            <TextInput
              multiline
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholderTextColor="#5C544A"
              className="mt-4 min-h-[120px] rounded-xl border border-border bg-surface p-4 text-base text-ink"
            />

            <View className="mt-6 gap-4">
              <Button
                loading={cancelMut.isPending}
                disabled={cancelReason.trim().length < 3 || cancelMut.isPending}
                onPress={async () => {
                  try {
                    await cancelMut.mutateAsync(cancelReason.trim());
                    setReasonOpen(false);
                    router.replace('/(sender)/history');
                  } catch (e: unknown) {
                    let msg = t('errors.UNKNOWN');
                    if (e instanceof HttpApiError) msg = (locale === 'en' ? e.messageEn : e.message) ?? e.messageEn;
                    Alert.alert(t('common.errorTitle'), msg);
                  }
                }}
              >
                {t('shipmentNew.cancelShipment')}
              </Button>

              <Button variant="ghost" onPress={() => setReasonOpen(false)}>
                {t('common.cancel')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={disputeOpen} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/45 px-5">
          <View className="w-full max-h-[85%] rounded-3xl bg-bg p-6">
            <Text className="text-lg font-semibold text-ink">{t('shipmentNew.disputeTitle')}</Text>
            <Text className="mt-2 text-sm text-inkSoft">{t('shipmentNew.disputeExplain')}</Text>
            <Text className="mt-4 text-sm font-medium text-inkSoft">{t('shipmentNew.disputeReasonLabel')}</Text>
            <TextInput
              multiline
              value={disputeReason}
              onChangeText={setDisputeReason}
              placeholder={t('shipmentNew.disputeReasonPlaceholder')}
              placeholderTextColor="#5C544A"
              className="mt-2 min-h-[100px] rounded-xl border border-border bg-surface p-4 text-base text-ink"
            />

            <Button
              variant="secondary"
              containerClassName="mt-4"
              loading={disputePhotoBusy}
              disabled={disputePhotoBusy || disputeMut.isPending}
              onPress={async () => {
                const perm = await ImagePicker.requestCameraPermissionsAsync();
                if (!perm.granted) {
                  Alert.alert(t('common.errorTitle'), t('driver.cameraPermissionDenied'));
                  return;
                }
                const shot = await ImagePicker.launchCameraAsync({ quality: 0.7 });
                if (shot.canceled || !shot.assets?.[0]?.uri) return;
                const uri = shot.assets[0].uri;
                setDisputePhotoBusy(true);
                try {
                  const url = await uploadShipmentPhoto(uri);
                  setDisputePhotoUrl(url);
                } catch (e: unknown) {
                  let msg = t('errors.UNKNOWN');
                  if (e instanceof HttpApiError) msg = (locale === 'en' ? e.messageEn : e.message) ?? e.messageEn;
                  Alert.alert(t('common.errorTitle'), msg);
                } finally {
                  setDisputePhotoBusy(false);
                }
              }}
            >
              {disputePhotoUrl ? t('shipmentNew.disputeReplacePhoto') : t('shipmentNew.disputeAddPhoto')}
            </Button>
            {disputePhotoUrl ? (
              <Image source={{ uri: disputePhotoUrl }} className="mt-3 h-32 w-full rounded-xl bg-border" resizeMode="cover" />
            ) : null}

            <View className="mt-6 gap-4">
              <Button
                loading={disputeMut.isPending}
                disabled={disputeReason.trim().length < 3 || !disputePhotoUrl || disputeMut.isPending || disputePhotoBusy}
                onPress={async () => {
                  if (!disputePhotoUrl || disputeReason.trim().length < 3) return;
                  try {
                    await disputeMut.mutateAsync({ reason: disputeReason.trim(), photoUrls: [disputePhotoUrl] });
                    setDisputeOpen(false);
                    setDisputeReason('');
                    setDisputePhotoUrl(null);
                    Alert.alert('', t('shipmentNew.disputeSuccess'));
                  } catch (e: unknown) {
                    let msg = t('errors.UNKNOWN');
                    if (e instanceof HttpApiError) msg = (locale === 'en' ? e.messageEn : e.message) ?? e.messageEn;
                    Alert.alert(t('common.errorTitle'), msg);
                  }
                }}
              >
                {t('shipmentNew.disputeSubmit')}
              </Button>
              <Button
                variant="ghost"
                onPress={() => {
                  setDisputeOpen(false);
                  setDisputeReason('');
                  setDisputePhotoUrl(null);
                }}
              >
                {t('common.cancel')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
