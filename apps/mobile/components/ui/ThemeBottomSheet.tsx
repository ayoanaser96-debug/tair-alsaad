import type { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/lib/theme';

type ThemeBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
};

export function ThemeBottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: PropsWithChildren<ThemeBottomSheetProps>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          style={[styles.backdrop, { backgroundColor: theme.colors.ink, opacity: 0.45 }]}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopStartRadius: theme.radius.sheet,
              borderTopEndRadius: theme.radius.sheet,
              paddingHorizontal: theme.spacing.xl,
              paddingTop: theme.spacing.md,
              paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.line, height: theme.spacing.xs, marginBottom: theme.spacing.lg }]} />
          {title ? (
            <AppText variant="title" style={{ marginBottom: subtitle ? theme.spacing.xs : theme.spacing.lg }}>
              {title}
            </AppText>
          ) : null}
          {subtitle ? (
            <AppText variant="body" color="inkMuted" style={{ marginBottom: theme.spacing.lg }}>
              {subtitle}
            </AppText>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    borderRadius: 2,
  },
});
