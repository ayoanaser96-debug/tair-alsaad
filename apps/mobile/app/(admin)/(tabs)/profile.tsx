import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Text, View } from 'react-native';

import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';

export default function AdminProfileTab() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const doLogout = () => {
    Alert.alert(t('auth.logout'), '', [
      { text: t('common.cancel', 'Cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          queryClient.clear();
          router.replace('/(auth)/phone');
        },
      },
    ]);
  };

  return (
    <Screen className="justify-start bg-surface pt-14 pb-28">
      <Text className="mb-8 px-4 text-2xl font-bold text-ink">{t('navigation.profile', 'Profile')}</Text>
      <View className="px-4 gap-2">
        <Text className="text-lg font-medium text-ink">{user?.name}</Text>
        <Text className="text-sm text-stone-600">{user?.phone}</Text>
        <Text className="text-xs capitalize text-primary">admin</Text>
      </View>
      <View className="mt-10 px-4 gap-4">
        <Pressable
          className="rounded-xl border border-border bg-white px-4 py-4"
          accessibilityRole="button"
          onPress={() => router.replace('/(auth)/role')}
        >
          <Text className="text-base font-medium text-ink">{t('auth.switchDashboard')}</Text>
        </Pressable>
        <Button variant="secondary" onPress={doLogout}>
          {t('auth.logout')}
        </Button>
      </View>
    </Screen>
  );
}
