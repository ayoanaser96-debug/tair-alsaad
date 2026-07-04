import { ScrollView, StyleSheet, View } from 'react-native';

import { Skeleton, SkeletonBlock } from '@/components/ui/Skeleton';
import { useTheme } from '@/lib/theme';

export function ShipmentDetailSkeleton() {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.xxxl,
        gap: theme.spacing.xl,
      }}
    >
      <View style={[styles.statusCard, { borderRadius: theme.radius.card }]}>
        <Skeleton height={12} width="40%" />
        <Skeleton height={28} width="65%" style={{ marginTop: theme.spacing.sm }} />
        <Skeleton height={14} width="50%" style={{ marginTop: theme.spacing.sm }} />
      </View>

      <Skeleton height={32} width="45%" />

      <Skeleton height={360} radius={theme.radius.card} />

      <View style={{ gap: theme.spacing.md }}>
        <Skeleton height={20} width="35%" />
        <SkeletonBlock lines={4} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    padding: 16,
    gap: 4,
  },
});
