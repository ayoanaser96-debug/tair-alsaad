import { StyleSheet, View } from 'react-native';

import { Skeleton, SkeletonBlock } from '@/components/ui/Skeleton';
import { useTheme } from '@/lib/theme';

export function SenderHomeSkeleton() {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.xl, paddingBottom: theme.spacing.xxxl }}>
      <View style={{ gap: theme.spacing.sm }}>
        <Skeleton height={28} width="55%" />
        <Skeleton height={16} width="40%" />
      </View>

      <View style={[styles.hero, { borderRadius: theme.radius.card }]}>
        <SkeletonBlock lines={5} />
        <Skeleton height={48} radius={theme.radius.button} style={{ marginTop: theme.spacing.md }} />
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <Skeleton height={72} style={{ flex: 1, borderRadius: theme.radius.card }} />
        <Skeleton height={72} style={{ flex: 1, borderRadius: theme.radius.card }} />
        <Skeleton height={72} style={{ flex: 1, borderRadius: theme.radius.card }} />
      </View>

      <Skeleton height={20} width="35%" />
      <Skeleton height={96} radius={theme.radius.card} />
      <Skeleton height={96} radius={theme.radius.card} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 16,
    gap: 8,
  },
});
