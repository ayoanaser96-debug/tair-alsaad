import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { router } from 'expo-router';

import { authenticatedTabsHref } from '@/lib/loginIntent';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';

import { useAuthStore } from '@/stores/authStore';

export function AdminAccessDenied() {
  const { t } = useTranslation();
  const setAppHomeSegment = useAuthStore((s) => s.setAppHomeSegment);
  const clearDashboardShell = useAuthStore((s) => s.clearDashboardShell);

  const goSender = async () => {
    await setAppHomeSegment('sender');
    router.replace(authenticatedTabsHref('sender'));
  };

  const openPicker = async () => {
    await clearDashboardShell();
    router.replace('/select-role');
  };

  return (
    <Screen className="justify-center px-5">
      <View className="gap-4">
        <Text className="text-center text-2xl font-bold text-ink">{t('admin.accessDeniedTitle')}</Text>
        <Text className="text-center text-base text-inkSoft">{t('admin.accessDeniedBody')}</Text>
        <Button onPress={() => void goSender()}>{t('admin.openSenderHome')}</Button>
        <Button variant="secondary" onPress={() => void openPicker()}>
          {t('admin.openRolePicker')}
        </Button>
      </View>
    </Screen>
  );
}
