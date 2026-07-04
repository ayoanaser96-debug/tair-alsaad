import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Link } from 'expo-router';

import { SharedProfileScreen } from '@/components/authenticated/SharedProfileScreen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/lib/theme';

export default function SenderProfileTab() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={{ flex: 1, paddingBottom: theme.spacing.xxxl + 88 }}>
      <SharedProfileScreen
        prepend={
          <Link href="/(sender)/saved-addresses" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('shipmentNew.addressesTitle')}
            >
              <Card style={styles.addressLink}>
                <AppText variant="bodyBold">{t('shipmentNew.addressesTitle')}</AppText>
                <AppText variant="caption" color="inkMuted" style={{ marginTop: theme.spacing.xs }}>
                  {t('shipmentNew.addressesSubtitle')}
                </AppText>
              </Card>
            </Pressable>
          </Link>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addressLink: {
    gap: 0,
  },
});
