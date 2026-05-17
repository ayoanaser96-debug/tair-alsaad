import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { authenticatedTabsHref } from '@/lib/loginIntent';
import { queryClient } from '@/lib/queryClient';
import type { AppHomeSegment } from '@/lib/secure';
import { useAuthStore } from '@/stores/authStore';

export default function SelectRoleScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setRole = useAuthStore((s) => s.setRole);
  const logout = useAuthStore((s) => s.logout);

  const apiRole = String(user?.role ?? '').toLowerCase();

  const choose = async (segment: AppHomeSegment) => {
    if (segment === 'admin' && apiRole !== 'admin') return;
    if (segment === 'driver' && apiRole !== 'driver') return;
    await setRole(segment);
    router.replace(authenticatedTabsHref(segment));
  };

  return (
    <Screen className="justify-start px-5 pt-14 pb-10">
      <Text className="mb-2 text-center text-2xl font-bold text-ink">{t('auth.postLoginRoleTitle')}</Text>
      <Text className="mb-10 text-center text-sm leading-6 text-inkSoft">{t('auth.postLoginRoleSubtitle')}</Text>

      <View className="gap-4">
        <RolePickRow title={t('auth.intentSender')} hint={t('auth.hintSender')} onPress={() => void choose('sender')} />
        <RolePickRow title={t('auth.intentReceiver')} hint={t('auth.hintReceiver')} onPress={() => void choose('receiver')} />
        <RolePickRow
          title={t('auth.intentDriver')}
          hint={t('auth.hintDriver')}
          disabled={apiRole !== 'driver'}
          onPress={() => void choose('driver')}
        />
        <RolePickRow
          title={t('auth.intentAdmin')}
          hint={t('auth.hintAdmin')}
          disabled={apiRole !== 'admin'}
          onPress={() => void choose('admin')}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        className="mt-12 items-center py-4"
        onPress={() => {
          void logout().then(() => {
            queryClient.clear();
            router.replace('/(auth)/login');
          });
        }}
      >
        <Text className="text-base text-primary">{t('common.cancel')}</Text>
      </Pressable>
    </Screen>
  );
}

function RolePickRow({
  title,
  hint,
  disabled,
  onPress,
}: {
  title: string;
  hint: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      className={`rounded-2xl border border-border bg-surface px-4 py-4 active:opacity-80 ${disabled ? 'opacity-45' : ''}`}
    >
      <Text className="text-lg font-semibold text-ink">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-inkSoft">{hint}</Text>
    </Pressable>
  );
}
