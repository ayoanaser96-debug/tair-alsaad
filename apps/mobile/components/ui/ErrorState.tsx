import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/EmptyState';

type ErrorStateProps = {
  onRetry: () => void;
  subtitle?: string;
};

export function ErrorState({ onRetry, subtitle }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      title={t('common.errorTitle')}
      subtitle={subtitle ?? t('sender.states.errorSubtitle')}
      actionLabel={t('common.retry')}
      onAction={onRetry}
    />
  );
}
