import { Pressable, ScrollView, Switch, View } from 'react-native';

import type { PackageType, WeightTier } from '@tayralsaad/types';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ThemeInput } from '@/components/ui/ThemeInput';
import { localizeDigits } from '@/lib/auth/phoneFormat';
import { useTheme } from '@/lib/theme';
import { useDraftShipmentStore } from '@/stores/draftShipmentStore';

const SIZE_OPTIONS: Array<{
  type: PackageType;
  weightTier: WeightTier;
  key: 'small' | 'medium' | 'large';
}> = [
  { key: 'small', type: 'small', weightTier: 'light' },
  { key: 'medium', type: 'medium', weightTier: 'medium' },
  { key: 'large', type: 'large', weightTier: 'heavy' },
];

export function CreatePackageStep() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const pkg = useDraftShipmentStore((s) => s.package);
  const paymentMethod = useDraftShipmentStore((s) => s.paymentMethod);
  const setPackage = useDraftShipmentStore((s) => s.setPackage);
  const setPaymentMethod = useDraftShipmentStore((s) => s.setPaymentMethod);

  const codEnabled = paymentMethod === 'cash_on_delivery';

  const formatCodAmount = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    const formatted = Number(digits).toLocaleString('en-IQ');
    return localizeDigits(formatted, i18n.language);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: theme.spacing.md }}>
        {SIZE_OPTIONS.map((option) => {
          const selected = pkg.type === option.type;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              onPress={() => setPackage({ ...pkg, type: option.type, weightTier: option.weightTier })}
            >
              <Card
                style={{
                  borderWidth: 1.5,
                  borderColor: selected ? theme.colors.primary : theme.colors.line,
                  gap: theme.spacing.xs,
                }}
              >
                <AppText variant="title" color={selected ? 'primary' : 'ink'}>
                  {t(`shipmentNew.sizeCards.${option.key}.title`)}
                </AppText>
                <AppText variant="caption" color="inkMuted">
                  {t(`shipmentNew.sizeCards.${option.key}.examples`)}
                </AppText>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <ThemeInput
        label={t('shipmentNew.optionalDescription')}
        value={pkg.description ?? ''}
        onChangeText={(description) => setPackage({ ...pkg, description })}
      />

      <Card style={{ gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="bodyBold">{t('shipmentNew.codToggle')}</AppText>
          <Switch
            value={codEnabled}
            onValueChange={(on) => setPaymentMethod(on ? 'cash_on_delivery' : 'zaincash')}
            trackColor={{ false: theme.colors.line, true: theme.colors.primary }}
          />
        </View>
        {codEnabled ? (
          <ThemeInput
            label={t('shipmentNew.codAmount')}
            keyboardType="number-pad"
            value={pkg.declaredValue !== undefined ? formatCodAmount(String(pkg.declaredValue)) : ''}
            onChangeText={(v) => {
              const digits = v.replace(/\D/g, '');
              setPackage({ ...pkg, declaredValue: digits ? Number(digits) : undefined });
            }}
          />
        ) : null}
      </Card>
    </ScrollView>
  );
}
