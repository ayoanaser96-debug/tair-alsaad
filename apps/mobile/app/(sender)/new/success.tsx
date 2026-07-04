import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { BidiLtr } from '@/components/ui/Bidi';
import { BirdMotif } from '@/components/ui/BirdMotif';
import { Card } from '@/components/ui/Card';
import { ThemeButton } from '@/components/ui/ThemeButton';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { useTheme } from '@/lib/theme';

function webPublicOrigin(): string {
  const raw =
    (Constants.expoConfig?.extra as { webPublicUrl?: string } | undefined)?.webPublicUrl ??
    process.env.EXPO_PUBLIC_WEB_URL ??
    (__DEV__ ? 'http://localhost:5173' : 'https://tayralsaad.iq');
  return typeof raw === 'string' ? raw.replace(/\/$/, '') : 'https://tayralsaad.iq';
}

export default function NewShipmentSuccessScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id, tracking } = useLocalSearchParams<{ id?: string; tracking?: string }>();

  const code = typeof tracking === 'string' ? tracking : '';
  const sid = typeof id === 'string' ? id : '';
  const trackingUrl = code ? `${webPublicOrigin()}/track/${encodeURIComponent(code)}` : '';

  return (
    <ThemeScreen edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.line, paddingHorizontal: theme.spacing.lg }]}>
        <View style={styles.headerSide} />
        <AppText variant="bodyBold" align="center" style={styles.headerTitle}>
          {t('shipmentNew.successTitle')}
        </AppText>
        <View style={[styles.headerSide, styles.headerEnd]}>
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.replace('/(sender)/(tabs)')}>
            <AppText variant="body" color="primary">
              {t('common.close')}
            </AppText>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <BirdMotif size={56} />
          <AppText variant="title" align="center" style={{ marginTop: theme.spacing.md }}>
            {t('shipmentNew.successTitle')}
          </AppText>
          <AppText variant="body" color="inkMuted" align="center" style={{ marginTop: theme.spacing.xs }}>
            {t('shipmentNew.successSubtitle')}
          </AppText>
        </View>

        <Card style={{ marginTop: theme.spacing.xl }}>
          <AppText variant="caption" color="inkMuted">
            {t('shipment.trackingCode')}
          </AppText>
          <View style={{ marginTop: theme.spacing.sm, alignItems: 'center' }}>
            <BidiLtr text={code} className="text-3xl font-bold tracking-widest text-primary" />
          </View>
        </Card>

        <View style={[styles.actions, { marginTop: theme.spacing.xl, gap: theme.spacing.md }]}>
          <ThemeButton
            onPress={() => {
              void Clipboard.setStringAsync(code).then(() => Alert.alert('', t('common.copied')));
            }}
          >
            {t('shipmentNew.copyCode')}
          </ThemeButton>

          <ThemeButton
            variant="secondary"
            disabled={!trackingUrl}
            onPress={() => {
              void Clipboard.setStringAsync(trackingUrl).then(() => Alert.alert('', t('shipmentNew.shareCopiedLink')));
            }}
          >
            {t('shipmentNew.shareCopyLink')}
          </ThemeButton>

          <ThemeButton
            variant="secondary"
            onPress={async () => {
              const body = encodeURIComponent(t('shipmentNew.shareBody', { code }));
              const url = `whatsapp://send?text=${body}`;
              const ok = await Linking.canOpenURL(url).catch(() => false);
              if (ok) void Linking.openURL(url);
              else Alert.alert(t('common.errorTitle'), t('shipmentNew.shareWhatsAppUnavailable'));
            }}
          >
            {t('shipmentNew.shareWhatsApp')}
          </ThemeButton>

          <ThemeButton
            variant="secondary"
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
          </ThemeButton>

          <ThemeButton variant="ghost" disabled={!sid} onPress={() => router.replace(`/(sender)/shipments/${sid}`)}>
            {t('shipmentNew.trackNow')}
          </ThemeButton>
        </View>
      </ScrollView>
    </ThemeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    minHeight: 52,
  },
  headerSide: {
    width: 72,
  },
  headerEnd: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    marginTop: 32,
  },
  actions: {},
});
