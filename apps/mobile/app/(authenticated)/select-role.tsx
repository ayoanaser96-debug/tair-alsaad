import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { router } from 'expo-router';

import { AppText } from '@/components/ui/AppText';
import { ThemeButton } from '@/components/ui/ThemeButton';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { authenticatedTabsHref } from '@/lib/loginIntent';
import { shouldShowLocationPrePrompt } from '@/lib/location/permissionGate';
import { queryClient } from '@/lib/queryClient';
import type { AppHomeSegment } from '@/lib/secure';
import { displayVariantForLocale, useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';

export default function SelectRoleScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setRole = useAuthStore((s) => s.setRole);
  const logout = useAuthStore((s) => s.logout);

  const apiRole = String(user?.role ?? '').toLowerCase();

  const choose = async (segment: AppHomeSegment) => {
    if (segment === 'admin' && apiRole !== 'admin') return;
    if (segment === 'driver' && apiRole !== 'driver') return;
    await setRole(segment);

    if (segment === 'sender' && (await shouldShowLocationPrePrompt())) {
      router.replace({
        pathname: '/location-permission',
        params: { segment },
      });
      return;
    }

    router.replace(authenticatedTabsHref(segment));
  };

  return (
    <ThemeScreen>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xxl,
          paddingBottom: theme.spacing.xxxl,
          gap: theme.spacing.xl,
        }}
      >
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant={displayVariantForLocale(i18n.language)} align="center">
            {t('auth.postLoginRoleTitle')}
          </AppText>
          <AppText variant="body" color="inkMuted" align="center">
            {t('auth.postLoginRoleSubtitle')}
          </AppText>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <RolePickRow title={t('auth.intentSender')} hint={t('auth.hintSender')} onPress={() => void choose('sender')} />
          <RolePickRow
            title={t('auth.intentReceiver')}
            hint={t('auth.hintReceiver')}
            onPress={() => void choose('receiver')}
          />
          {apiRole === 'driver' ? (
            <RolePickRow
              title={t('auth.intentDriver')}
              hint={t('auth.hintDriver')}
              onPress={() => void choose('driver')}
            />
          ) : (
            <RolePickRow
              title={t('auth.intentDriver')}
              hint={t('auth.hintDriver')}
              onPress={() => router.push('/(driver)/apply')}
            />
          )}
          <RolePickRow
            title={t('auth.intentAdmin')}
            hint={t('auth.hintAdmin')}
            disabled={apiRole !== 'admin'}
            onPress={() => void choose('admin')}
          />
        </View>

        <ThemeButton
          variant="ghost"
          onPress={() => {
            void logout().then(() => {
              queryClient.clear();
              router.replace('/(auth)/login');
            });
          }}
        >
          {t('common.cancel')}
        </ThemeButton>
      </ScrollView>
    </ThemeScreen>
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
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={{
        borderRadius: theme.radius.card,
        borderWidth: 1,
        borderColor: theme.colors.line,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.xs,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <AppText variant="bodyBold">{title}</AppText>
      <AppText variant="caption" color="inkMuted">
        {hint}
      </AppText>
    </Pressable>
  );
}
