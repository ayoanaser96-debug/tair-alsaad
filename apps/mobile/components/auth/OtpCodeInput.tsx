import { useEffect, useRef } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/lib/theme';

export const OTP_LENGTH = 4;

type OtpCodeInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
  error?: boolean;
  shakeToken?: number;
  autoFocus?: boolean;
  disabled?: boolean;
};

export function OtpCodeInput({
  value,
  onChange,
  error = false,
  shakeToken = 0,
  autoFocus = true,
  disabled = false,
}: OtpCodeInputProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const reduced = useReducedMotion();
  const refs = useRef<Array<TextInput | null>>([]);
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    if (!error || reduced || shakeToken === 0) return;

    shakeX.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [error, reduced, shakeToken, shakeX]);

  useEffect(() => {
    if (autoFocus) {
      refs.current[0]?.focus();
    }
  }, [autoFocus]);

  const setAt = (index: number, char: string) => {
    const next = [...value];
    next[index] = char.slice(-1);
    onChange(next);
    if (char && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const onPaste = (text: string) => {
    const only = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    const chunk = only.split('');
    const next = Array.from({ length: OTP_LENGTH }, (_, idx) => chunk[idx] ?? '');
    onChange(next);
    if (chunk.length >= OTP_LENGTH) {
      refs.current[OTP_LENGTH - 1]?.blur();
    } else {
      refs.current[chunk.length]?.focus();
    }
  };

  const onCellKeyPress = (index: number): TextInputProps['onKeyPress'] => (event) => {
    if (event.nativeEvent.key !== 'Backspace') return;
    if (value[index]) {
      const next = [...value];
      next[index] = '';
      onChange(next);
      return;
    }
    if (index > 0) {
      refs.current[index - 1]?.focus();
      const next = [...value];
      next[index - 1] = '';
      onChange(next);
    }
  };

  return (
    <Animated.View style={[{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm }, shakeStyle]}>
      {value.map((digit, index) => (
        <TextInput
          key={`otp-${index}`}
          ref={(el) => {
            refs.current[index] = el;
          }}
          accessibilityLabel={`OTP ${index + 1}`}
          editable={!disabled}
          keyboardType="number-pad"
          maxLength={index === 0 ? OTP_LENGTH : 1}
          textContentType={index === 0 ? 'oneTimeCode' : 'none'}
          autoComplete={index === 0 ? 'sms-otp' : 'off'}
          value={digit}
          onChangeText={(text) => {
            if (text.length > 1) onPaste(text);
            else setAt(index, text);
          }}
          onKeyPress={onCellKeyPress(index)}
          style={{
            width: 56,
            height: 48,
            borderRadius: theme.radius.input,
            borderWidth: 1.5,
            borderColor: error ? theme.colors.danger : theme.colors.line,
            backgroundColor: theme.colors.surfaceAlt,
            textAlign: 'center',
            fontSize: theme.typeScale.title.fontSize,
            fontFamily: i18n.language.startsWith('ar')
              ? theme.fonts.bodyArBold
              : theme.fonts.bodyEnBold,
            color: theme.colors.ink,
          }}
        />
      ))}
    </Animated.View>
  );
}

type CountryCodeChipProps = {
  code?: string;
};

export function CountryCodeChip({ code = '+964' }: CountryCodeChipProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const display = i18n.language.startsWith('ar')
    ? code.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
    : code;

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.input,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.line,
        minHeight: 40,
        justifyContent: 'center',
      }}
    >
      <AppText variant="bodyBold" style={{ writingDirection: 'ltr' }}>
        {display}
      </AppText>
    </View>
  );
}

export function AuthFooterLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center' }}
    >
      <AppText variant="body" color="inkMuted" align="center">
        {label}
      </AppText>
    </Pressable>
  );
}
