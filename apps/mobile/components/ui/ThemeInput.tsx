import type { ReactNode } from 'react';
import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/lib/theme';

export type ThemeInputProps = TextInputProps & {
  label?: string;
  error?: string;
  prefix?: ReactNode;
};

export function ThemeInput({ label, error, prefix, style, onFocus, onBlur, ...props }: ThemeInputProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.line;

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label ? (
        <AppText variant="caption" color="inkMuted">
          {label}
        </AppText>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 48,
          borderRadius: theme.radius.input,
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: 1.5,
          borderColor,
          paddingHorizontal: theme.spacing.lg,
          gap: theme.spacing.sm,
        }}
      >
        {prefix}
        <TextInput
          placeholderTextColor={theme.colors.inkMuted}
          {...props}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            {
              flex: 1,
              fontFamily: i18n.language.startsWith('ar')
                ? theme.fonts.bodyArRegular
                : theme.fonts.bodyEnRegular,
              fontSize: theme.typeScale.body.fontSize,
              color: theme.colors.ink,
              paddingVertical: theme.spacing.md,
              textAlign: i18n.language.startsWith('ar') ? 'right' : 'left',
            },
            style,
          ]}
        />
      </View>
      {error ? (
        <AppText variant="caption" color="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
