import type { ReactNode } from 'react';
import { View } from 'react-native';

import { BirdMotif } from '@/components/ui/BirdMotif';
import { AppText } from '@/components/ui/AppText';
import { ThemeButton } from '@/components/ui/ThemeButton';
import { useTheme } from '@/lib/theme';

type EmptyStateProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  motif?: ReactNode;
};

export function EmptyState({ title, subtitle, actionLabel, onAction, motif }: EmptyStateProps) {
  const theme = useTheme();
  const summary = subtitle ? `${title}. ${subtitle}` : title;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={summary}
      style={{
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xxl,
        gap: theme.spacing.lg,
      }}
    >
      {motif ?? <BirdMotif size={56} />}
      <AppText variant="title" align="center" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="body" color="inkMuted" align="center" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {subtitle}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <ThemeButton accessibilityLabel={actionLabel} onPress={onAction} style={{ alignSelf: 'stretch' }}>
          {actionLabel}
        </ThemeButton>
      ) : null}
    </View>
  );
}
