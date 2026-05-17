import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import type { PaymentMethod } from '@tayralsaad/types';

import { formatIQD } from '@tayralsaad/utils';
import i18next from 'i18next';
import { router } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useDebouncedShipmentQuote } from '@/hooks/useDebouncedShipmentQuote';
import { HttpApiError } from '@/lib/api';
import { draftToCreateShipmentBody } from '@/lib/shipmentDraft';
import { mongoId, useCreateShipmentMutation } from '@/queries/shipments';
import { useDraftShipmentStore } from '@/stores/draftShipmentStore';

const PAY: PaymentMethod[] = ['cash_on_delivery', 'zaincash', 'fastpay', 'fib', 'asia_hawala'];

function iqLocale(): 'ar' | 'en' {
  return i18next.language.startsWith('en') ? 'en' : 'ar';
}

export default function NewShipmentReviewScreen() {
  const { t } = useTranslation();
  useDebouncedShipmentQuote();
  const create = useCreateShipmentMutation();

  const draftState = useDraftShipmentStore();

  const lastQuote = draftState.lastQuote;
  const quoteErr = draftState.quoteErrorCode;
  const setPaymentMethod = draftState.setPaymentMethod;
  const paymentMethod = draftState.paymentMethod;
  const resetDraft = draftState.resetDraft;

  const locale = iqLocale();

  const payLabels = useMemo(
    () =>
      ({
        cash_on_delivery: t('shipmentNew.payCod'),
        zaincash: t('shipmentNew.payZaincash'),
        fastpay: t('shipmentNew.payFastpay'),
        fib: t('shipmentNew.payFib'),
        asia_hawala: t('shipmentNew.payHawala'),
      }) satisfies Record<PaymentMethod, string>,
    [t],
  );

  async function confirm() {
    const body = draftToCreateShipmentBody(draftState);
    if (!body || !paymentMethod) return;

    await create.mutateAsync(body, {
      onSuccess: (created) => {
        resetDraft();
        router.replace({
          pathname: '/(sender)/new/success',
          params: { id: mongoId(created), tracking: created.trackingCode },
        });
      },
      onError: (e: unknown) => {
        let msg = t('errors.UNKNOWN');
        if (e instanceof HttpApiError) {
          msg = (locale === 'en' ? e.messageEn : e.message) ?? e.messageEn;
          const key = `errors.${e.code}` as const;
          const translated = t(key);
          if (translated && translated !== key) msg = translated;
        }
        Alert.alert(t('common.errorTitle'), msg);
      },
    });
  }

  return (
    <Screen edges={['top']}>
      <AppHeader title={t('shipmentNew.reviewTitle')} />

      <ScrollView className="flex-1 px-5 pb-40">
        {quoteErr ? (
          <Text className="mt-4 text-sm font-medium text-danger">
            {t(`errors.${quoteErr}`, { defaultValue: t('errors.UNKNOWN') })}
          </Text>
        ) : null}

        {!lastQuote && !quoteErr ? <Text className="mt-4 text-sm text-inkSoft">{t('shipmentNew.quoteStale')}</Text> : null}

        {lastQuote ? (
          <View className="mt-6 rounded-2xl border border-border bg-surface px-5 py-4">
            <Text className="text-base font-semibold text-ink">{t('shipment.quote')}</Text>
            <View className="mt-4 gap-2">
              <Row label={t('shipmentNew.pricingBase')} value={formatIQD(lastQuote.pricing.base, locale)} />
              <Row label={t('shipmentNew.pricingDistance')} value={formatIQD(lastQuote.pricing.distance, locale)} />
              {lastQuote.pricing.surcharge > 0 ? (
                <Row label={t('shipmentNew.pricingSurcharge')} value={formatIQD(lastQuote.pricing.surcharge, locale)} />
              ) : null}
              <Row label={t('shipmentNew.pricingSurge')} value={`×${(lastQuote.pricing.surge / 100).toFixed(2)}`} />
              <Row label={t('shipmentNew.pricingTotal')} value={formatIQD(lastQuote.pricing.total, locale)} emphasized />
              <Text className="mt-3 text-xs text-inkSoft">{t('shipmentNew.etaMinutes', { minutes: lastQuote.etaMinutes })}</Text>
            </View>
          </View>
        ) : null}

        <Text className="mt-10 text-lg font-semibold text-ink">{t('shipmentNew.payment')}</Text>
        <View className="mt-4 gap-3">
          {PAY.map((m) => {
            const sel = paymentMethod === m;
            return (
              <Pressable
                accessibilityRole="button"
                key={m}
                onPress={() => setPaymentMethod(m)}
                className={
                  sel ? 'rounded-xl border border-primary bg-surface px-4 py-4' : 'rounded-xl border border-border bg-bg px-4 py-4'
                }
              >
                <Text className={sel ? 'text-base font-semibold text-primary' : 'text-base text-ink'}>{payLabels[m]}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 gap-3 border-t border-border bg-bg px-5 py-4">
        <Button
          loading={create.isPending}
          disabled={!lastQuote || !paymentMethod || create.isPending}
          containerClassName="w-full"
          onPress={() => void confirm()}
        >
          {t('shipmentNew.confirm')}
        </Button>
      </View>
    </Screen>
  );
}

function Row(props: { label: string; value: string; emphasized?: boolean }) {
  const { label, value, emphasized } = props;
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm text-inkSoft">{label}</Text>
      <Text className={`text-sm ${emphasized ? 'font-semibold text-ink' : 'text-ink'}`}>{value}</Text>
    </View>
  );
}
