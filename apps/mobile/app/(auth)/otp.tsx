import { useEffect, useRef, useState } from 'react';

import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { OtpCodeInput, OTP_LENGTH } from '@/components/auth/OtpCodeInput';
import { AppText } from '@/components/ui/AppText';
import { ThemeInput } from '@/components/ui/ThemeInput';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { formatCountdown, formatPhoneForDisplay } from '@/lib/auth/phoneFormat';
import { authenticatedTabsHref } from '@/lib/loginIntent';
import { displayVariantForLocale, useTheme } from '@/lib/theme';
import { useRequestOtp, useVerifyOtp } from '@/queries/auth';
import { useAuthStore } from '@/stores/authStore';

export default function OtpScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = typeof params.phone === 'string' ? params.phone : '';
  const setSession = useAuthStore((s) => s.setSession);

  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: OTP_LENGTH }, () => ''));
  const [name, setName] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [otpError, setOtpError] = useState(false);
  const [shakeToken, setShakeToken] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const submittedCodeRef = useRef<string | null>(null);

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
      setDigits(Array.from({ length: OTP_LENGTH }, () => ''));
      setOtpError(false);
      submittedCodeRef.current = null;
    },
    onError: (e) => Alert.alert(t('common.errorTitle'), e.message),
  });

  const verify = useVerifyOtp({
    onSuccess: async (payload) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 450));

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
    onError: (e) => {
      setOtpError(true);
      setShakeToken((token) => token + 1);
      setDigits(Array.from({ length: OTP_LENGTH }, () => ''));
      submittedCodeRef.current = null;
      Alert.alert(t('common.errorTitle'), e.message);
    },
  });

  const code = digits.join('');

  const { mutate: verifyOtp, isPending: verifyPending } = verify;

  useEffect(() => {
    if (code.length !== OTP_LENGTH) return;
    if (verifyPending || showSuccess) return;
    if (submittedCodeRef.current === code) return;

    submittedCodeRef.current = code;
    verifyOtp({ phone, code, name: name.trim() || undefined });
  }, [code, name, phone, showSuccess, verifyOtp, verifyPending]);

  const handleDigitsChange = (next: string[]) => {
    setDigits(next);
    if (otpError) setOtpError(false);
  };

  const countdownLabel = formatCountdown(seconds, i18n.language);

  return (
    <ThemeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.xxl,
            paddingBottom: theme.spacing.xxxl,
            gap: theme.spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant={displayVariantForLocale(i18n.language)}>
              {t('auth.otpEnterTitle')}
            </AppText>
            <AppText variant="body" color="inkMuted">
              {t('auth.otpEnterSubtitle')}
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing.sm }}>
              <AppText variant="bodyBold" color="primary" style={{ writingDirection: 'ltr' }}>
                {formatPhoneForDisplay(phone, i18n.language)}
              </AppText>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/(auth)/login')}
                style={{ minHeight: 48, justifyContent: 'center' }}
              >
                <AppText variant="body" color="primary">
                  {t('auth.editPhone')}
                </AppText>
              </Pressable>
            </View>
          </View>

          <OtpCodeInput
            value={digits}
            onChange={handleDigitsChange}
            error={otpError}
            shakeToken={shakeToken}
            disabled={verifyPending || showSuccess}
          />

          {showSuccess ? (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing.md }}>
              <AppText variant="title" color="accent" align="center">
                ✓
              </AppText>
            </View>
          ) : null}

          <ThemeInput
            label={t('placeholders.nameOptional')}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!verifyPending && !showSuccess}
          />

          <View style={{ alignItems: 'center', marginTop: theme.spacing.md }}>
            <Pressable
              accessibilityRole="button"
              disabled={seconds > 0 || request.isPending}
              onPress={() => request.mutate({ phone })}
              style={{ minHeight: 48, justifyContent: 'center' }}
            >
              <AppText
                variant="body"
                color={seconds > 0 ? 'inkMuted' : 'primary'}
                align="center"
              >
                {seconds > 0 ? t('auth.resendCountdown', { time: countdownLabel }) : t('auth.resendActive')}
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemeScreen>
  );
}
