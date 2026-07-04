import { StyleSheet, View } from 'react-native';

import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { BirdMotif } from '@/components/ui/BirdMotif';
import { AppText } from '@/components/ui/AppText';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/lib/theme';

export function CreateMatchingOverlay() {
  const theme = useTheme();
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0.85);
  const orbit = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    pulse.value = withRepeat(withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, true);
    orbit.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.linear }), -1, false);
  }, [orbit, pulse, reduced]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.35,
  }));

  const birdStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${orbit.value * 360}deg` },
      { translateX: 42 },
    ],
  }));

  return (
    <View style={[styles.overlay, { backgroundColor: `${theme.colors.bg}E6` }]}>
      <View style={styles.center}>
        {!reduced ? (
          <Animated.View
            style={[
              styles.ring,
              { borderColor: theme.colors.primary },
              ringStyle,
            ]}
          />
        ) : null}
        <View style={[styles.core, { backgroundColor: theme.colors.surface }]}>
          {!reduced ? (
            <Animated.View style={birdStyle}>
              <BirdMotif size={36} />
            </Animated.View>
          ) : (
            <BirdMotif size={36} />
          )}
        </View>
      </View>
      <AppText variant="title" align="center" style={{ marginTop: theme.spacing.xl }}>
        {t('shipmentNew.matchingStatus')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  center: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  core: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
