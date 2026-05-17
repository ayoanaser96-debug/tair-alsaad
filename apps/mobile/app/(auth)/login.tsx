import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Text, View } from 'react-native';

import { Link, router } from 'expo-router';

import { normalizePhone } from '@tayralsaad/utils';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useRequestOtp } from '@/queries/auth';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [local, setLocal] = useState('');
  const [errorText, setErrorText] = useState<string>();

  const requestOtp = useRequestOtp({
    onError: (err) => {
      setErrorText(err.message);
      Alert.alert(t('common.errorTitle'), err.message);
    },
    onSuccess: (_data, variables) => {
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: variables.phone },
      });
    },
  });

  const canSubmit = useMemo(() => local.replace(/\D/g, '').length >= 9, [local]);

  const submit = () => {
    const digitsOnly = local.replace(/\D/g, '');
    try {
      const phone = normalizePhone(digitsOnly);
      setErrorText(undefined);
      requestOtp.mutate({ phone });
    } catch {
      setErrorText(t('errors.VALIDATION_FAILED'));
    }
  };

  return (
    <Screen className="justify-center px-5">
      <View className="mb-10 items-center gap-2">
        <Text className="text-center text-2xl font-bold text-ink">{t('common.appName')}</Text>
        <Text className="text-center text-base text-inkSoft">{t('auth.phoneHint')}</Text>
      </View>

      <Input
        keyboardType="phone-pad"
        label={t('auth.phoneTitle')}
        accessibilityLabel={t('auth.phoneTitle')}
        value={local}
        onChangeText={setLocal}
        maxLength={14}
        error={errorText}
        prefix={<Text className="pl-1 pr-1 text-lg font-medium text-ink">+964</Text>}
        placeholder={t('placeholders.phoneLocal')}
      />

      <View className="mt-10 gap-4">
        <Button loading={requestOtp.isPending} disabled={!canSubmit} onPress={submit}>
          {t('common.continue')}
        </Button>
        <Pressable onPress={() => router.push('/(auth)/receiver-track')} style={{ alignSelf: 'center' }}>
          <Text className="text-center text-sm text-inkSoft">{t('track.receiverForSomeoneElse')}</Text>
        </Pressable>
        <Link href="/language" style={{ alignSelf: 'center', marginTop: 8 }}>
          <Text className="text-base text-primary">{t('language.title')}</Text>
        </Link>
      </View>
    </Screen>
  );
}
