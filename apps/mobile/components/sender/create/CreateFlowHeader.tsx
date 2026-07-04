import { Pressable, StyleSheet, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { I18nManager, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/lib/theme';

type CreateFlowHeaderProps = {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
};

export function CreateFlowHeader({ title, onBack, onClose }: CreateFlowHeaderProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const chevron = I18nManager.isRTL
    ? Platform.OS === 'ios'
      ? 'chevron-forward'
      : 'arrow-forward'
    : Platform.OS === 'ios'
      ? 'chevron-back'
      : 'arrow-back';

  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: theme.colors.line,
          backgroundColor: theme.colors.bg,
          paddingHorizontal: theme.spacing.lg,
        },
      ]}
    >
      <View style={styles.side}>
        {onBack ? (
          <Pressable accessibilityRole="button" hitSlop={10} onPress={onBack} style={styles.iconBtn}>
            <Ionicons name={chevron} size={Platform.OS === 'ios' ? 28 : 24} color={theme.colors.ink} />
          </Pressable>
        ) : null}
      </View>
      <AppText variant="bodyBold" align="center" style={{ flex: 1 }}>
        {title}
      </AppText>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>
        {onClose ? (
          <Pressable accessibilityRole="button" hitSlop={10} onPress={onClose}>
            <AppText variant="body" color="primary">
              {t('common.close')}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    minHeight: 52,
  },
  side: {
    width: 72,
  },
  iconBtn: {
    padding: 4,
  },
});
