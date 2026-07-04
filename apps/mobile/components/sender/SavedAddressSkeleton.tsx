import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/lib/theme';

export function SavedAddressSkeleton() {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      {[0, 1, 2].map((key) => (
        <View
          key={key}
          style={[
            styles.card,
            {
              borderRadius: theme.radius.card,
              borderColor: theme.colors.line,
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Skeleton height={36} width={36} radius={12} />
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Skeleton height={16} width="45%" />
              <Skeleton height={12} width="80%" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Skeleton height={44} style={{ flex: 1, borderRadius: 12 }} />
            <Skeleton height={44} style={{ flex: 1, borderRadius: 12 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
});
