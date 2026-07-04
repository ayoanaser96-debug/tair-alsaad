import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/lib/theme';

type BirdMotifProps = {
  size?: number;
  style?: ViewStyle;
};

/** Minimal saffron bird / paper-glider mark for approved motif slots only. */
export function BirdMotif({ size = 40, style }: BirdMotifProps) {
  const theme = useTheme();
  const wing = size * 0.55;
  const body = size * 0.22;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width: size, height: size * 0.7, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <View
        style={{
          width: wing,
          height: body,
          backgroundColor: theme.colors.accent,
          borderTopStartRadius: wing,
          borderTopEndRadius: 4,
          borderBottomStartRadius: 4,
          borderBottomEndRadius: wing,
          transform: [{ rotate: '-18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          end: size * 0.18,
          top: size * 0.12,
          width: body * 0.9,
          height: body * 0.9,
          borderRadius: body,
          backgroundColor: theme.colors.primary,
        }}
      />
    </View>
  );
}

export function BirdMotifSlot({ children }: { children?: ReactNode }) {
  return <View className="items-center justify-center">{children ?? <BirdMotif size={48} />}</View>;
}
