import { useCallback, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import { I18nManager } from 'react-native';

import { CreateConfirmStep } from '@/components/sender/create/CreateConfirmStep';
import { CreateFlowFooter } from '@/components/sender/create/CreateFlowFooter';
import { CreateFlowHeader } from '@/components/sender/create/CreateFlowHeader';
import { CreateFlowProgress } from '@/components/sender/create/CreateFlowProgress';
import { CreatePackageStep } from '@/components/sender/create/CreatePackageStep';
import { CreatePricingStep } from '@/components/sender/create/CreatePricingStep';
import { CreateRouteStep } from '@/components/sender/create/CreateRouteStep';
import { CreateMatchingOverlay } from '@/components/sender/create/CreateMatchingOverlay';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { useDebouncedShipmentQuote } from '@/hooks/useDebouncedShipmentQuote';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { HttpApiError } from '@/lib/api';
import { draftToCreateShipmentBody } from '@/lib/shipmentDraft';
import { mongoId, useCreateShipmentMutation } from '@/queries/shipments';
import { useDraftShipmentStore } from '@/stores/draftShipmentStore';

const STEP_TITLE_KEYS = [
  'shipmentNew.steps.route',
  'shipmentNew.steps.package',
  'shipmentNew.steps.pricing',
  'shipmentNew.steps.confirm',
] as const;

export function CreateShipmentWizard() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'ar';
  const reduced = useReducedMotion();
  useDebouncedShipmentQuote();

  const [step, setStep] = useState(0);
  const [routeErrors, setRouteErrors] = useState<Record<string, string | undefined>>({});

  const draft = useDraftShipmentStore();
  const resetDraft = useDraftShipmentStore((s) => s.resetDraft);
  const create = useCreateShipmentMutation();

  const stepTitle = t(STEP_TITLE_KEYS[step]);

  const entering = reduced
    ? FadeIn.duration(200)
    : I18nManager.isRTL
      ? SlideInLeft.duration(250)
      : SlideInRight.duration(250);
  const exiting = reduced
    ? FadeOut.duration(150)
    : I18nManager.isRTL
      ? SlideOutRight.duration(200)
      : SlideOutLeft.duration(200);

  const validateRoute = useCallback(() => {
    const errors: Record<string, string | undefined> = {};
    if (!draft.pickup.city.trim()) errors.pickupCity = t('shipmentNew.errors.cityRequired');
    if (!draft.pickup.area.trim()) errors.pickupArea = t('shipmentNew.errors.areaRequired');
    if (!draft.dropoff.city.trim()) errors.dropoffCity = t('shipmentNew.errors.cityRequired');
    if (!draft.dropoff.area.trim()) errors.dropoffArea = t('shipmentNew.errors.areaRequired');
    if (!draft.receiver.name.trim()) errors.receiverName = t('shipmentNew.errors.receiverName');
    if (!draft.receiver.phone.trim()) errors.receiverPhone = t('shipmentNew.errors.receiverPhone');
    setRouteErrors(errors);
    return Object.keys(errors).length === 0;
  }, [draft.dropoff.area, draft.dropoff.city, draft.pickup.area, draft.pickup.city, draft.receiver.name, draft.receiver.phone, t]);

  const confirmDiscard = useCallback(
    (onDiscard: () => void) => {
      Alert.alert(t('shipmentNew.discardConfirmTitle'), t('shipmentNew.discardConfirmBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('shipmentNew.cancelDraft'), style: 'destructive', onPress: onDiscard },
      ]);
    },
    [t],
  );

  const closeFlow = useCallback(() => {
    confirmDiscard(() => {
      resetDraft();
      router.replace('/(sender)/(tabs)');
    });
  }, [confirmDiscard, resetDraft]);

  const goBack = useCallback(() => {
    if (step === 0) {
      closeFlow();
      return;
    }
    setStep((s) => s - 1);
  }, [closeFlow, step]);

  const goNext = useCallback(() => {
    if (step === 0 && !validateRoute()) return;
    if (step === 2 && !draft.lastQuote) {
      Alert.alert(t('common.errorTitle'), t('shipmentNew.quoteStale'));
      return;
    }
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
  }, [draft.lastQuote, step, t, validateRoute]);

  const submit = useCallback(async () => {
    const body = draftToCreateShipmentBody(draft);
    if (!body || !draft.paymentMethod || !draft.lastQuote) return;

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
        }
        Alert.alert(t('common.errorTitle'), msg);
      },
    });
  }, [create, draft, locale, resetDraft, t]);

  const primaryLabel = step === 3 ? t('shipmentNew.confirmFindCourier') : t('common.next');
  const primaryDisabled = useMemo(() => {
    if (step === 2) return !draft.lastQuote;
    if (step === 3) return !draft.lastQuote || !draft.paymentMethod || create.isPending;
    return false;
  }, [create.isPending, draft.lastQuote, draft.paymentMethod, step]);

  const onPrimary = step === 3 ? () => void submit() : goNext;

  return (
    <ThemeScreen edges={['top', 'bottom']}>
      <CreateFlowHeader title={stepTitle} onBack={goBack} onClose={closeFlow} />
      <CreateFlowProgress step={step} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={styles.flex}>
          <Animated.View key={`create-step-${step}`} entering={entering} exiting={exiting} style={styles.flex}>
            {step === 0 ? <CreateRouteStep errors={routeErrors} /> : null}
            {step === 1 ? <CreatePackageStep /> : null}
            {step === 2 ? <CreatePricingStep /> : null}
            {step === 3 ? <CreateConfirmStep /> : null}
          </Animated.View>
        </View>

        <CreateFlowFooter
          primaryLabel={primaryLabel}
          onPrimary={onPrimary}
          primaryDisabled={primaryDisabled}
          primaryLoading={create.isPending}
        />
      </KeyboardAvoidingView>

      {create.isPending ? <CreateMatchingOverlay /> : null}
    </ThemeScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
