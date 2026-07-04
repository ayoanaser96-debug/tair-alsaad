import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SafeAreaViewProps } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/lib/theme';

export type ThemeScreenProps = SafeAreaViewProps & {
  warmGradient?: boolean;
};

export function ThemeScreen({
  children,
  warmGradient = true,
  style,
  edges = ['top', 'bottom'],
  ...rest
}: PropsWithChildren<ThemeScreenProps>) {
  const theme = useTheme();

  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: theme.colors.bg }, style]} {...rest}>
      {warmGradient ? (
        <LinearGradient
          colors={[theme.colors.bg, `${theme.colors.surfaceAlt}18`]}
          locations={[0, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.28 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
