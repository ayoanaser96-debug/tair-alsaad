import { useTranslation } from 'react-i18next';

import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import type { PackageType, WeightTier } from '@tayralsaad/types';

import { router } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useDebouncedShipmentQuote } from '@/hooks/useDebouncedShipmentQuote';
import { useDraftShipmentStore } from '@/stores/draftShipmentStore';

const PKG_TYPES: PackageType[] = ['envelope', 'small', 'medium', 'large', 'fragile', 'cold'];
const WGTS: WeightTier[] = ['light', 'medium', 'heavy'];

function tw(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export default function NewShipmentPackageScreen() {
  const { t } = useTranslation();
  useDebouncedShipmentQuote();

  const pkg = useDraftShipmentStore((s) => s.package);
  const setPackage = useDraftShipmentStore((s) => s.setPackage);
  const resetDraft = useDraftShipmentStore((s) => s.resetDraft);

  return (
    <Screen edges={['top']}>
      <AppHeader title={t('shipmentNew.packageTitle')} />
      <ScrollView className="flex-1 px-5 pb-28">
        <Text className="mt-6 text-sm font-semibold text-ink">{t('shipment.package')}</Text>
        <View className="mt-3 flex-row flex-wrap gap-3">
          {PKG_TYPES.map((p) => {
            const sel = pkg.type === p;
            return (
              <Pressable
                key={p}
                accessibilityRole="button"
                onPress={() => setPackage({ ...pkg, type: p })}
                className={tw('rounded-xl border px-4 py-2', sel ? 'border-primary bg-surface' : 'border-border bg-bg')}
              >
                <Text className={tw('text-sm', sel ? 'font-semibold text-primary' : 'text-inkSoft')}>{t(`shipmentNew.pkgTypes.${p}`)}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-8 text-sm font-semibold text-ink">{t('shipmentNew.weightTier')}</Text>
        <View className="mt-3 flex-row flex-wrap gap-3">
          {WGTS.map((w) => {
            const sel = pkg.weightTier === w;
            return (
              <Pressable
                key={w}
                accessibilityRole="button"
                onPress={() => setPackage({ ...pkg, weightTier: w })}
                className={tw('rounded-xl border px-4 py-2', sel ? 'border-primary bg-surface' : 'border-border bg-bg')}
              >
                <Text className={tw('text-sm', sel ? 'font-semibold text-primary' : 'text-inkSoft')}>
                  {t(`shipmentNew.weights.${w}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-10 gap-4">
          <Input
            label={t('shipmentNew.optionalDescription')}
            value={pkg.description ?? ''}
            onChangeText={(description) => setPackage({ ...pkg, description })}
          />
          <Input
            keyboardType="numeric"
            label={t('shipmentNew.declaredValue')}
            value={pkg.declaredValue !== undefined ? String(pkg.declaredValue) : ''}
            placeholder="0"
            onChangeText={(v) => setPackage({ ...pkg, declaredValue: v ? Number(v) : undefined })}
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
        <Button containerClassName="w-full" onPress={() => router.push('/(sender)/new/service')}>
          {t('common.next')}
        </Button>
      </View>
    </Screen>
  );
}
