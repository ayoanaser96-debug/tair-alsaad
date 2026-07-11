import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { router } from 'expo-router';

import { AppText } from '@/components/ui/AppText';
import { ThemeButton } from '@/components/ui/ThemeButton';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { queryClient } from '@/lib/queryClient';
import { displayVariantForLocale, useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';

export default function AdminProfileTab() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const clearDashboardShell = useAuthStore((s) => s.clearDashboardShell);

  const doLogout = () => {
    Alert.alert(t('auth.logout'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          queryClient.clear();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ThemeScreen>
      <View
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xxl,
          paddingBottom: theme.spacing.xxxl,
          gap: theme.spacing.xl,
        }}
      >
        <AppText variant={displayVariantForLocale(i18n.language)}>{t('navigation.profile')}</AppText>

        {user ? (
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="bodyBold">{user.name}</AppText>
            <AppText variant="body" color="inkMuted" style={{ writingDirection: 'ltr' }}>
              {user.phone}
            </AppText>
            <AppText variant="caption" color="primary">
              {t('auth.roleAdmin')}
            </AppText>
          </View>
        ) : null}

        <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
          <ThemeButton
            variant="secondary"
            onPress={() => {
              void clearDashboardShell().then(() => router.replace('/select-role'));
            }}
          >
            {t('auth.switchDashboard')}
          </ThemeButton>

          <Pressable
            accessibilityRole="button"
            onPress={doLogout}
            style={{
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.button,
              borderWidth: 1,
              borderColor: theme.colors.danger,
            }}
          >
            <AppText variant="bodyBold" color="danger">
              {t('auth.logout')}
            </AppText>
          </Pressable>
        </View>
      </View>
    </ThemeScreen>
  );
}
