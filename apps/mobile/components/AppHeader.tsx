import type { PropsWithChildren, ReactNode } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';

export type AppHeaderProps = {
  title: string;
  right?: ReactNode;
  /** When false, no back button shown. */
  canGoBack?: boolean;
};

export function AppHeader(props: PropsWithChildren<AppHeaderProps>) {
  const { title, right, canGoBack = true } = props;
  const router = useRouter();

  const showBack = canGoBack && router.canGoBack();

  return (
    <View className="flex-row items-center gap-3 border-b border-border bg-bg px-4 py-3">
      <View className="w-11 items-start">
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => router.back()}
            className="-ml-1 p-1"
          >
            <Ionicons
              name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
              size={Platform.OS === 'ios' ? 28 : 24}
              color="#2F4A5C"
            />
          </Pressable>
        ) : null}
      </View>
      <Text className="flex-1 text-center text-lg font-semibold text-ink" numberOfLines={1}>
        {title}
      </Text>
      <View className="w-11 items-end">{right}</View>
    </View>
  );
}
