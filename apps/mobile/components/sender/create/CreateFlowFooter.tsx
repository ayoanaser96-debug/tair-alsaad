import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { ThemeButton } from '@/components/ui/ThemeButton';
import { useTheme } from '@/lib/theme';

type CreateFlowFooterProps = {
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function CreateFlowFooter({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryLoading,
  secondaryLabel,
  onSecondary,
  children,
}: PropsWithChildren<CreateFlowFooterProps>) {
  const theme = useTheme();

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: theme.colors.line,
        backgroundColor: theme.colors.bg,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
        gap: theme.spacing.sm,
      }}
    >
      {children}
      {secondaryLabel && onSecondary ? (
        <ThemeButton variant="ghost" onPress={onSecondary}>
          {secondaryLabel}
        </ThemeButton>
      ) : null}
      <ThemeButton loading={primaryLoading} disabled={primaryDisabled} onPress={onPrimary}>
        {primaryLabel}
      </ThemeButton>
    </View>
  );
}
