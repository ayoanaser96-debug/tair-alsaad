import type { PropsWithChildren } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';

import { resolveTypographyVariant, type TypographyVariant, useTheme } from '@/lib/theme';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: 'ink' | 'inkMuted' | 'primary' | 'accent' | 'danger' | 'white';
  align?: 'start' | 'center' | 'end';
};

function resolveTextAlign(align: AppTextProps['align']): TextStyle['textAlign'] {
  if (align === 'center') return 'center';
  if (align === 'end') return I18nManager.isRTL ? 'left' : 'right';
  return I18nManager.isRTL ? 'right' : 'left';
}

export function AppText({
  variant = 'body',
  color = 'ink',
  align = 'start',
  style,
  children,
  ...rest
}: PropsWithChildren<AppTextProps>) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const typo = resolveTypographyVariant(variant, i18n.language);
  const textAlign = resolveTextAlign(align);

  const colorValue = theme.colors[color === 'white' ? 'white' : color];

  return (
    <Text
      {...rest}
      style={[typo as TextStyle, { color: colorValue, textAlign }, style]}
    >
      {children}
    </Text>
  );
}
