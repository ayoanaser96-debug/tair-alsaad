import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import type { PropsWithChildren } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary: 'bg-primary active:opacity-90',
  secondary: 'border border-primary bg-transparent active:bg-surface',
  ghost: 'bg-transparent active:bg-surface',
  danger: 'bg-danger active:opacity-90',
};

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-2 rounded-lg',
  md: 'px-4 py-3 rounded-xl',
  lg: 'px-5 py-4 rounded-xl',
};

const labelClassForVariant = (variant: Variant) => {
  switch (variant) {
    case 'secondary':
      return 'text-primary';
    case 'ghost':
      return 'text-primary';
    default:
      return 'text-white';
  }
};

function tw(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export type ButtonProps = PressableProps & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  containerClassName?: string;
};

export function Button(props: PropsWithChildren<ButtonProps>) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    containerClassName,
    disabled,
    children,
    className,
    ...rest
  } = props;
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      disabled={isDisabled}
      className={tw(
        'items-center justify-center',
        variantClass[variant],
        sizeClass[size],
        isDisabled && 'opacity-50',
        containerClassName,
        className ?? '',
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#2F4A5C' : '#FFFFFF'} />
      ) : (
        <Text className={tw('text-center font-semibold', labelClassForVariant(variant))}>{children}</Text>
      )}
    </Pressable>
  );
}
