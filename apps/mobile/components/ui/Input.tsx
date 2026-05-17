import { TextInput, View, Text, type TextInputProps } from 'react-native';

import type { ReactNode } from 'react';

function tw(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  /** Renders inline before the field (e.g. country prefix). */
  prefix?: ReactNode;
};

export function Input({ label, error, className, prefix, ...props }: InputProps) {
  return (
    <View className="w-full gap-1">
      {label ? <Text className="text-inkSoft text-sm font-medium">{label}</Text> : null}
      <View
        className={tw(
          'w-full flex-row items-center rounded-xl border border-border bg-surface px-4',
          error ? 'border-danger' : '',
        )}
      >
        {prefix}
        <TextInput
          placeholderTextColor="#5C544A"
          {...props}
          className={tw(
            'min-h-[48px] flex-1 py-3 text-base text-ink',
            props.editable === false ? 'opacity-60' : '',
            className ?? '',
          )}
        />
      </View>
      {error ? (
        <Text className="text-danger text-xs" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
