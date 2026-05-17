import { useTranslation } from 'react-i18next';

import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';

import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';

function webPublicOrigin(): string {
  const raw =
    (Constants.expoConfig?.extra as { webPublicUrl?: string } | undefined)?.webPublicUrl ??
    process.env.EXPO_PUBLIC_WEB_URL ??
    (__DEV__ ? 'http://localhost:5173' : 'https://tayralsaad.iq');
  return typeof raw === 'string' ? raw.replace(/\/$/, '') : 'https://tayralsaad.iq';
}

export default function NewShipmentSuccessScreen() {
  const { t } = useTranslation();
  const { id, tracking } = useLocalSearchParams<{ id?: string; tracking?: string }>();

  const code = typeof tracking === 'string' ? tracking : '';
  const sid = typeof id === 'string' ? id : '';
  const trackingUrl = code ? `${webPublicOrigin()}/track/${encodeURIComponent(code)}` : '';

  return (
    <Screen edges={['top']}>
      <AppHeader
        title={t('shipmentNew.successTitle')}
        canGoBack={false}
        right={
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.replace('/(sender)/(tabs)')}>
            <Text className="text-sm font-semibold text-primary">{t('common.close')}</Text>
          </Pressable>
        }
      />

      <ScrollView className="flex-1 px-5 pb-10">
        <Text className="mt-10 text-lg font-semibold text-ink">{t('shipment.trackingCode')}</Text>
        <Text selectable className="mt-6 text-center text-3xl font-bold tracking-widest text-primary">
          {code}
        </Text>

        <View className="mt-14 gap-4">
          <Button
            containerClassName="w-full"
            onPress={() => {
              void Clipboard.setStringAsync(code).then(() => Alert.alert('', t('common.copied')));
            }}
          >
            {t('shipmentNew.copyCode')}
          </Button>

          <Button
            variant="secondary"
            containerClassName="w-full"
            disabled={!trackingUrl}
            onPress={() => {
              void Clipboard.setStringAsync(trackingUrl).then(() => Alert.alert('', t('shipmentNew.shareCopiedLink')));
            }}
          >
            {t('shipmentNew.shareCopyLink')}
          </Button>

          <Button
            variant="secondary"
            containerClassName="w-full"
            onPress={async () => {
              const body = encodeURIComponent(t('shipmentNew.shareBody', { code }));
              const url = `whatsapp://send?text=${body}`;
              const ok = await Linking.canOpenURL(url).catch(() => false);
              if (ok) void Linking.openURL(url);
              else Alert.alert(t('common.errorTitle'), t('shipmentNew.shareWhatsAppUnavailable'));
            }}
          >
            {t('shipmentNew.shareWhatsApp')}
          </Button>

          <Button
            variant="secondary"
            containerClassName="w-full"
            onPress={async () => {
              const body = encodeURIComponent(t('shipmentNew.shareBody', { code }));
              const smsUrl = `sms:?body=${body}`;
              const ok = await Linking.canOpenURL(smsUrl).catch(() => false);
              if (!ok) {
                Alert.alert(t('common.errorTitle'), t('shipmentNew.shareSmsUnavailable'));
                return;
              }
              void Linking.openURL(smsUrl);
            }}
          >
            {t('shipmentNew.shareSms')}
          </Button>

          <Button variant="ghost" disabled={!sid} containerClassName="w-full" onPress={() => router.replace(`/(sender)/shipments/${sid}`)}>
            {t('shipmentNew.trackNow')}
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
