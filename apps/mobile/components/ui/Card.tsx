import type { PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/lib/theme';

export type CardProps = ViewProps & {
  padded?: boolean;
};

export function Card({ children, style, padded = true, ...rest }: PropsWithChildren<CardProps>) {
  const theme = useTheme();

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.card,
          padding: padded ? theme.spacing.lg : 0,
          borderWidth: 1,
          borderColor: theme.colors.line,
        },
        theme.shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}
