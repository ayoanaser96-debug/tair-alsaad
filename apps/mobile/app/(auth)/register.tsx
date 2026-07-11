import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { router } from 'expo-router';

import { normalizePhone } from '@tayralsaad/utils';

import { AuthFooterLink, CountryCodeChip } from '@/components/auth/OtpCodeInput';
import { AppText } from '@/components/ui/AppText';
import { ThemeButton } from '@/components/ui/ThemeButton';
import { ThemeInput } from '@/components/ui/ThemeInput';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import {
  formatLocalPhoneDisplay,
  isValidIraqiLocalPhone,
  localizeDigits,
  stripLocalPhoneDigits,
} from '@/lib/auth/phoneFormat';
import { displayVariantForLocale, useTheme } from '@/lib/theme';
import { useRequestOtp } from '@/queries/auth';

type SignupRole = 'sender' | 'driver';

export default function RegisterScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [local, setLocal] = useState('');
  const [role, setRole] = useState<SignupRole>('sender');
  const [errorText, setErrorText] = useState<string>();
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const requestOtp = useRequestOtp({
    onError: (err) => {
      setErrorText(err.message);
      Alert.alert(t('common.errorTitle'), err.message);
    },
    onSuccess: (data, variables) => {
      router.push({
        pathname: '/(auth)/otp',
        params: {
          phone: variables.phone,
          name: name.trim(),
          role,
          mode: 'register',
          expiresIn: String(data.expiresIn),
          ...(data.devCode ? { devCode: data.devCode } : {}),
        },
      });
    },
  });

  const digits = stripLocalPhoneDigits(local);
  const canSubmit = name.trim().length >= 2 && isValidIraqiLocalPhone(digits);

  const inlineError = useMemo(() => {
    if (errorText) return errorText;
    if (!attemptedSubmit && digits.length === 0) return undefined;
    if (digits.length > 0 && !digits.startsWith('7')) return t('auth.phoneMustStartWith7');
    return undefined;
  }, [attemptedSubmit, digits, errorText, t]);

  const submit = () => {
    setAttemptedSubmit(true);
    if (name.trim().length < 2) {
      setErrorText(t('errors.VALIDATION_FAILED'));
      return;
    }
    if (!canSubmit) {
      if (!digits.startsWith('7')) {
        setErrorText(t('auth.phoneMustStartWith7'));
      } else {
        setErrorText(t('errors.VALIDATION_FAILED'));
      }
      return;
    }

    try {
      const phone = normalizePhone(`0${digits}`);
      setErrorText(undefined);
      requestOtp.mutate({ phone });
    } catch {
      setErrorText(t('errors.VALIDATION_FAILED'));
    }
  };

  const placeholder = localizeDigits('7XX XXX XXXX', i18n.language);

  return (
    <ThemeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.xxl,
            gap: theme.spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant={displayVariantForLocale(i18n.language)} align="center">
              {t('auth.registerScreenTitle')}
            </AppText>
            <AppText variant="body" color="inkMuted" align="center">
              {t('auth.registerScreenSubtitle')}
            </AppText>
          </View>

          <ThemeInput
            label={t('auth.fullName')}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrorText(undefined);
            }}
            autoCapitalize="words"
          />

          <View style={{ gap: theme.spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
              <CountryCodeChip />
              <View style={{ flex: 1 }}>
                <ThemeInput
                  keyboardType="phone-pad"
                  accessibilityLabel={t('auth.phoneTitle')}
                  value={local}
                  onChangeText={(text) => {
                    setLocal(formatLocalPhoneDisplay(text, i18n.language));
                    setErrorText(undefined);
                  }}
                  maxLength={14}
                  error={inlineError}
                  placeholder={placeholder}
                />
              </View>
            </View>
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="bodyBold">{t('auth.selectSignupRole')}</AppText>
            <View style={{ gap: theme.spacing.sm }}>
              <RoleOption
                title={t('auth.intentSender')}
                hint={t('auth.hintSender')}
                selected={role === 'sender'}
                onPress={() => setRole('sender')}
              />
              <RoleOption
                title={t('auth.intentDriver')}
                hint={t('auth.hintDriver')}
                selected={role === 'driver'}
                onPress={() => setRole('driver')}
              />
            </View>
          </View>

          <ThemeButton loading={requestOtp.isPending} disabled={!canSubmit} onPress={submit}>
            {t('auth.createAccount')}
          </ThemeButton>

          <AuthFooterLink
            label={`${t('auth.hasAccount')} ${t('auth.signInLink')}`}
            onPress={() => router.replace('/(auth)/login')}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/language')}
            style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center' }}
          >
            <AppText variant="body" color="primary" align="center">
              {t('language.title')}
            </AppText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemeScreen>
  );
}

function RoleOption({
  title,
  hint,
  selected,
  onPress,
}: {
  title: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        borderRadius: theme.radius.card,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.line,
        backgroundColor: selected ? theme.colors.surfaceAlt : theme.colors.surface,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.xs,
      }}
    >
      <AppText variant="bodyBold" color={selected ? 'primary' : 'ink'}>
        {title}
      </AppText>
      <AppText variant="caption" color="inkMuted">
        {hint}
      </AppText>
    </Pressable>
  );
}
