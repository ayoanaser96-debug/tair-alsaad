import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { BirdMotif } from '@/components/ui/BirdMotif';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/lib/theme';

const BUILDINGS = [
  { width: 28, height: 52 },
  { width: 36, height: 72 },
  { width: 22, height: 44 },
  { width: 40, height: 88 },
  { width: 30, height: 58 },
  { width: 34, height: 64 },
  { width: 26, height: 48 },
] as const;

export function WelcomeIllustration() {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const floatY = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;

    floatY.value = withRepeat(
      withTiming(6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [floatY, reduced]);

  const birdStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: reduced ? 0 : floatY.value }],
  }));

  return (
    <View style={styles.root} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.birdWrap, birdStyle]}>
        <BirdMotif size={88} />
      </Animated.View>

      <View style={[styles.horizon, { backgroundColor: theme.colors.line }]} />

      <View style={styles.skyline}>
        {BUILDINGS.map((building, index) => (
          <View
            key={`${building.width}-${building.height}-${index}`}
            style={[
              styles.building,
              {
                width: building.width,
                height: building.height,
                marginStart: index === 0 ? 0 : 6,
                borderColor: theme.colors.line,
                backgroundColor: theme.colors.surface,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    minHeight: 220,
  },
  birdWrap: {
    marginBottom: 32,
    alignItems: 'center',
  },
  horizon: {
    width: '88%',
    height: 1,
    marginBottom: 0,
  },
  skyline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 4,
    minHeight: 96,
  },
  building: {
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopStartRadius: 4,
    borderTopEndRadius: 4,
  },
});
