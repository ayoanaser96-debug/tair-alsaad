import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import type { Shipment, ShipmentRating } from '@tayralsaad/types';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ThemeButton } from '@/components/ui/ThemeButton';
import { ThemeInput } from '@/components/ui/ThemeInput';
import { HttpApiError } from '@/lib/api';
import { useTheme } from '@/lib/theme';

type RatePayload = { stars: 1 | 2 | 3 | 4 | 5; comment?: string };

type ShipmentRatingSectionProps = {
  shipment: Shipment;
  locale: 'ar' | 'en';
  rateMut: {
    isPending: boolean;
    mutateAsync: (payload: RatePayload) => Promise<unknown>;
  };
};

function StarDisplay({ stars, accent, muted }: { stars: number; accent: string; muted: string }) {
  return (
    <View style={styles.starRow} accessibilityRole="text">
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <Ionicons
          key={n}
          name={n <= stars ? 'star' : 'star-outline'}
          size={22}
          color={n <= stars ? accent : muted}
        />
      ))}
    </View>
  );
}

export function ShipmentRatingSection({ shipment, locale, rateMut }: ShipmentRatingSectionProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const [rateStars, setRateStars] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [rateComment, setRateComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const existing: ShipmentRating | undefined = shipment.rating;

  if (existing) {
    return (
      <Card style={{ gap: theme.spacing.sm, borderColor: theme.colors.primary, borderWidth: 1 }}>
        <AppText variant="bodyBold" color="primary">
          {t('sender.yourRating')}
        </AppText>
        <StarDisplay stars={existing.stars} accent={theme.colors.accent} muted={theme.colors.line} />
        {existing.comment ? (
          <AppText variant="body" color="inkMuted">
            {existing.comment}
          </AppText>
        ) : null}
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card style={{ alignItems: 'center', gap: theme.spacing.md }}>
        <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
        <AppText variant="bodyBold" align="center" style={{ color: theme.colors.success }}>
          {t('sender.ratingSuccess')}
        </AppText>
      </Card>
    );
  }

  return (
    <Card style={{ gap: theme.spacing.md }}>
      <AppText variant="title">{t('sender.rateDriverTitle')}</AppText>
      <AppText variant="body" color="inkMuted">
        {t('sender.rateStars')}
      </AppText>

      <View style={styles.starPicker}>
        {([1, 2, 3, 4, 5] as const).map((n) => {
          const filled = rateStars !== null && n <= rateStars;
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={t('sender.rateStarLabel', { count: n })}
              onPress={() => setRateStars(n)}
              style={[
                styles.starBtn,
                {
                  borderColor: filled ? theme.colors.accent : theme.colors.line,
                  backgroundColor: theme.colors.surfaceAlt,
                },
              ]}
            >
              <Ionicons name={filled ? 'star' : 'star-outline'} size={24} color={theme.colors.accent} />
            </Pressable>
          );
        })}
      </View>

      <ThemeInput
        label={t('sender.rateComment')}
        value={rateComment}
        onChangeText={setRateComment}
        multiline
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />

      <ThemeButton
        loading={rateMut.isPending}
        disabled={rateStars === null || rateMut.isPending}
        onPress={async () => {
          if (!rateStars) return;
          try {
            await rateMut.mutateAsync({ stars: rateStars, comment: rateComment.trim() || undefined });
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSubmitted(true);
            setRateComment('');
            setRateStars(null);
          } catch (e: unknown) {
            let msg = t('errors.UNKNOWN');
            if (e instanceof HttpApiError) msg = (locale === 'en' ? e.messageEn : e.message) ?? e.messageEn;
            Alert.alert(t('common.errorTitle'), msg);
          }
        }}
      >
        {t('sender.submitRating')}
      </ThemeButton>
    </Card>
  );
}

const styles = StyleSheet.create({
  starRow: {
    flexDirection: 'row',
    gap: 4,
  },
  starPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  starBtn: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
});
