import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { useTheme } from '@/lib/theme';

export default function SenderNotificationsTabScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <ThemeScreen>
      <View
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xxxl + 88,
        }}
      >
        <AppText variant="title" style={{ marginBottom: theme.spacing.xl }}>
          {t('navigation.notifications')}
        </AppText>
        <EmptyState title={t('sender.notifications.emptyTitle')} subtitle={t('sender.notifications.emptySubtitle')} />
      </View>
    </ThemeScreen>
  );
}
