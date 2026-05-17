import { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { authenticatedTabsHref } from '@/lib/loginIntent';
import { useRequestOtp, useVerifyOtp } from '@/queries/auth';

import { BidiLtr } from '@/components/ui/Bidi';
import { useAuthStore } from '@/stores/authStore';

const CELL_COUNT = 4;

export default function OtpScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = typeof params.phone === 'string' ? params.phone : '';
  const setSession = useAuthStore((s) => s.setSession);

  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: CELL_COUNT }, () => ''));
  const refs = useRef<Array<TextInput | null>>([]);
  const [name, setName] = useState('');
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (!phone) router.replace('/(auth)/login');
  }, [phone]);

  useEffect(() => {
    if (!seconds) return;
    const id = setInterval(() => setSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const request = useRequestOtp({
    onSuccess: ({ expiresIn }) => {
      setSeconds(expiresIn);
    },
    onError: (e) => Alert.alert(t('common.errorTitle'), e.message),
  });

  const verify = useVerifyOtp({
    onSuccess: async (payload) => {
      const apiRole = String(payload.user.role ?? '').toLowerCase();
      if (apiRole === 'driver') {
        await setSession({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
          initialShell: 'driver',
        });
        router.replace(authenticatedTabsHref('driver'));
        return;
      }
      if (apiRole === 'admin') {
        await setSession({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
          initialShell: 'admin',
        });
        router.replace(authenticatedTabsHref('admin'));
        return;
      }
      await setSession({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: payload.user,
        clearHome: true,
      });
      router.replace('/select-role');
    },
    onError: (e) => Alert.alert(t('common.errorTitle'), e.message),
  });

  const code = digits.join('');

  const setAt = (i: number, char: string) => {
    const next = [...digits];
    next[i] = char.slice(-1);
    setDigits(next);
    if (char && i < CELL_COUNT - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (text: string) => {
    const only = text.replace(/\D/g, '').slice(0, CELL_COUNT);
    const chunk = only.split('');
    const next = Array.from({ length: CELL_COUNT }, (_, idx) => chunk[idx] ?? '');
    setDigits(next);
    if (chunk.length >= CELL_COUNT) refs.current[CELL_COUNT - 1]?.blur();
    else refs.current[chunk.length]?.focus();
  };

  return (
    <Screen className="px-5 pt-6">
      <View className="mb-8 gap-2">
        <Text className="text-2xl font-bold text-ink">{t('auth.otpTitle')}</Text>
        <Text className="text-inkSoft">{t('auth.otpHint')}</Text>
        <BidiLtr text={phone} className="mt-2 text-base font-semibold text-primary" />
        <Text className="mt-3 text-sm leading-6 text-inkSoft">{t('auth.postOtpHint')}</Text>
      </View>

      <View className="mb-6 flex-row justify-between gap-2">
        {digits.map((d, idx) => (
          <TextInput
            key={`otp-cell-${idx}`}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            accessibilityLabel={`OTP ${idx + 1}`}
            className="h-14 flex-1 rounded-xl border border-border bg-surface text-center text-xl text-ink"
            keyboardType="number-pad"
            maxLength={idx === 0 ? CELL_COUNT : 1}
            value={d}
            onChangeText={(txt) => {
              if (txt.length > 1) onPaste(txt);
              else setAt(idx, txt);
            }}
          />
        ))}
      </View>

      <Input
        label={t('placeholders.nameOptional')}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        className="mb-6"
      />

      <Button
        loading={verify.isPending}
        disabled={code.length !== CELL_COUNT}
        onPress={() => verify.mutate({ phone, code, name: name.trim() || undefined })}
      >
        {t('common.confirm')}
      </Button>

      <View className="mt-8 items-center">
        <TouchableOpacity
          accessibilityRole="button"
          disabled={seconds > 0 || request.isPending}
          onPress={() => request.mutate({ phone })}
        >
          <Text className={`text-base ${seconds > 0 ? 'text-inkSoft' : 'text-primary'}`}>
            {seconds > 0 ? t('auth.resendIn', { seconds }) : t('auth.resend')}
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
