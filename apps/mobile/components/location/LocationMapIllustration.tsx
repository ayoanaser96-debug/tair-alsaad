import { StyleSheet, View } from 'react-native';

import { BirdMotif } from '@/components/ui/BirdMotif';
import { useTheme } from '@/lib/theme';

export function LocationMapIllustration() {
  const theme = useTheme();

  return (
    <View
      style={styles.root}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={{ marginBottom: 20 }}>
        <BirdMotif size={72} />
      </View>

      <View
        style={[
          styles.mapCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.line,
            borderRadius: theme.radius.card,
            ...theme.shadow.card,
          },
        ]}
      >
        <View style={[styles.gridLineH, { backgroundColor: theme.colors.line, top: '33%' }]} />
        <View style={[styles.gridLineH, { backgroundColor: theme.colors.line, top: '66%' }]} />
        <View style={[styles.gridLineV, { backgroundColor: theme.colors.line, start: '33%' }]} />
        <View style={[styles.gridLineV, { backgroundColor: theme.colors.line, start: '66%' }]} />

        <View
          style={[
            styles.pinOuter,
            {
              backgroundColor: `${theme.colors.primary}33`,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <View style={[styles.pinInner, { backgroundColor: theme.colors.primary }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  mapCard: {
    width: '100%',
    maxWidth: 280,
    height: 180,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLineH: {
    position: 'absolute',
    start: 0,
    end: 0,
    height: 1,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  pinOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
