import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonBlock } from '@/components/ui/Skeleton';
import { ThemeButton } from '@/components/ui/ThemeButton';
import { ThemeInput } from '@/components/ui/ThemeInput';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { displayVariantForLocale, useTheme } from '@/lib/theme';

export default function DesignLabScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [showError, setShowError] = useState(false);

  return (
    <ThemeScreen>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          gap: theme.spacing.xl,
          paddingBottom: theme.spacing.xxxl,
        }}
      >
        <AppText variant={displayVariantForLocale(i18n.language)}>{t('designLab.title')}</AppText>
        <AppText variant="caption" color="inkMuted">
          {t('designLab.subtitle')}
        </AppText>

        <Card>
          <AppText variant="title" style={{ marginBottom: theme.spacing.md }}>
            {t('designLab.typography')}
          </AppText>
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="displayAr">طير السعد</AppText>
            <AppText variant="displayEn">Tayr Al-Saad</AppText>
            <AppText variant="title">{t('designLab.sampleTitle')}</AppText>
            <AppText variant="body">{t('designLab.sampleBody')}</AppText>
            <AppText variant="caption" color="inkMuted">
              {t('designLab.sampleCaption')}
            </AppText>
          </View>
        </Card>

        <Card>
          <AppText variant="title" style={{ marginBottom: theme.spacing.md }}>
            {t('designLab.buttons')}
          </AppText>
          <View style={{ gap: theme.spacing.sm }}>
            <ThemeButton>{t('designLab.primary')}</ThemeButton>
            <ThemeButton variant="secondary">{t('designLab.secondary')}</ThemeButton>
            <ThemeButton variant="ghost">{t('designLab.ghost')}</ThemeButton>
            <ThemeButton variant="danger">{t('designLab.danger')}</ThemeButton>
            <ThemeButton loading>{t('designLab.loading')}</ThemeButton>
          </View>
        </Card>

        <Card>
          <AppText variant="title" style={{ marginBottom: theme.spacing.md }}>
            {t('designLab.inputs')}
          </AppText>
          <View style={{ gap: theme.spacing.md }}>
            <ThemeInput
              label={t('designLab.inputLabel')}
              placeholder={t('designLab.inputPlaceholder')}
              value={inputValue}
              onChangeText={setInputValue}
            />
            <ThemeInput
              label={t('designLab.inputErrorLabel')}
              value=""
              error={showError ? t('designLab.inputError') : undefined}
              onFocus={() => setShowError(true)}
            />
          </View>
        </Card>

        <Card>
          <AppText variant="title" style={{ marginBottom: theme.spacing.md }}>
            {t('designLab.skeleton')}
          </AppText>
          <SkeletonBlock lines={4} />
          <Skeleton height={120} radius={theme.radius.card} style={{ marginTop: theme.spacing.md }} />
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <EmptyState
            title={t('designLab.emptyTitle')}
            subtitle={t('designLab.emptySubtitle')}
            actionLabel={t('designLab.emptyAction')}
            onAction={() => undefined}
          />
        </Card>
      </ScrollView>
    </ThemeScreen>
  );
}
