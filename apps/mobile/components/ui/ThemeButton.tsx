import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps, type TextStyle, type ViewStyle } from 'react-native';

import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/lib/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ThemeButtonProps = PressableProps & {
  variant?: Variant;
  loading?: boolean;
  labelStyle?: TextStyle;
  style?: ViewStyle;
};

export function ThemeButton({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  style,
  labelStyle,
  onPressIn,
  onPressOut,
  ...rest
}: PropsWithChildren<ThemeButtonProps>) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const isDisabled = Boolean(disabled || loading);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
        ? theme.colors.danger
        : variant === 'secondary'
          ? theme.colors.surface
          : 'transparent';

  const borderWidth = variant === 'secondary' ? 1 : 0;
  const borderColor = variant === 'secondary' ? theme.colors.primary : 'transparent';
  const textColor =
    variant === 'primary' || variant === 'danger'
      ? theme.colors.white
      : variant === 'secondary'
        ? theme.colors.primary
        : theme.colors.primary;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isDisabled}
      {...rest}
      onPressIn={(e) => {
        if (!isDisabled && !reduced) {
          scale.value = withTiming(0.97, { duration: 150 });
          void Haptics.selectionAsync();
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reduced) scale.value = withTiming(1, { duration: 150 });
        onPressOut?.(e);
      }}
      style={[
        {
          minHeight: 54,
          borderRadius: theme.radius.button,
          backgroundColor,
          borderWidth,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.xl,
          opacity: isDisabled ? 0.5 : 1,
        },
        variant === 'primary' ? theme.shadow.button : undefined,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            {
              fontFamily: theme.fonts.bodyArMedium,
              fontSize: theme.typeScale.body.fontSize,
              color: textColor,
              textAlign: 'center',
            },
            labelStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </AnimatedPressable>
  );
}
