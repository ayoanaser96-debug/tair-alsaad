import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { I18nManager } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { BirdMotif } from '@/components/ui/BirdMotif';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/lib/theme';

const LOGO_DURATION_MS = 450;
const BIRD_DELAY_MS = 300;
const BIRD_DURATION_MS = 600;
const WORDMARK_DELAY_MS = 200;
const WORDMARK_DURATION_MS = 400;
const MIN_SEQUENCE_MS = 1500;
const MAX_SEQUENCE_MS = 2200;
const HOLD_SKELETON_MS = 1500;

type BootSplashProps = {
  sessionReady: boolean;
  onComplete: () => void;
};

export function BootSplash({ sessionReady, onComplete }: BootSplashProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const completedRef = useRef(false);
  const [showHoldSkeleton, setShowHoldSkeleton] = useState(false);

  const logoScale = useSharedValue(reduced ? 1 : 0.85);
  const logoOpacity = useSharedValue(0);
  const lockupOpacity = useSharedValue(0);
  const birdTranslateX = useSharedValue(0);
  const birdTranslateY = useSharedValue(0);
  const birdOpacity = useSharedValue(1);
  const wordmarkOpacity = useSharedValue(0);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: reduced ? lockupOpacity.value : logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const birdStyle = useAnimatedStyle(() => ({
    opacity: birdOpacity.value,
    transform: [
      { translateX: birdTranslateX.value },
      { translateY: birdTranslateY.value },
    ],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: reduced ? lockupOpacity.value : wordmarkOpacity.value,
  }));

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const glideX = I18nManager.isRTL ? -72 : 72;
    const glideY = -48;

    if (reduced) {
      lockupOpacity.value = withTiming(1, { duration: 300 }, (done) => {
        if (done) runOnJS(finish)();
      });
      return;
    }

    logoOpacity.value = withTiming(1, { duration: LOGO_DURATION_MS });
    logoScale.value = withTiming(1, { duration: LOGO_DURATION_MS });

    birdTranslateX.value = withDelay(BIRD_DELAY_MS, withTiming(glideX, { duration: BIRD_DURATION_MS }));
    birdTranslateY.value = withDelay(BIRD_DELAY_MS, withTiming(glideY, { duration: BIRD_DURATION_MS }));
    birdOpacity.value = withDelay(BIRD_DELAY_MS, withTiming(0, { duration: BIRD_DURATION_MS }));

    wordmarkOpacity.value = withDelay(
      WORDMARK_DELAY_MS,
      withTiming(1, { duration: WORDMARK_DURATION_MS }),
    );

    const animationEndMs = Math.min(
      MAX_SEQUENCE_MS,
      Math.max(
        MIN_SEQUENCE_MS,
        BIRD_DELAY_MS + BIRD_DURATION_MS,
        WORDMARK_DELAY_MS + WORDMARK_DURATION_MS,
      ),
    );

    const timer = setTimeout(() => {
      if (sessionReady) {
        finish();
        return;
      }
      setShowHoldSkeleton(true);
    }, animationEndMs);

    return () => clearTimeout(timer);
  }, [
    birdOpacity,
    birdTranslateX,
    birdTranslateY,
    finish,
    lockupOpacity,
    logoOpacity,
    logoScale,
    reduced,
    sessionReady,
    wordmarkOpacity,
  ]);

  useEffect(() => {
    if (!showHoldSkeleton || sessionReady) return;

    const timer = setTimeout(() => {
      if (sessionReady) finish();
    }, HOLD_SKELETON_MS);

    return () => clearTimeout(timer);
  }, [finish, sessionReady, showHoldSkeleton]);

  useEffect(() => {
    if (sessionReady && showHoldSkeleton) {
      finish();
    }
  }, [finish, sessionReady, showHoldSkeleton]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <Animated.View style={[styles.lockup, logoStyle]}>
        <View
          style={[
            styles.logoPlate,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.card,
              ...theme.shadow.card,
            },
          ]}
        >
          <BirdMotif size={64} />
        </View>
      </Animated.View>

      {!reduced ? (
        <Animated.View style={[styles.glideBird, birdStyle]} pointerEvents="none">
          <BirdMotif size={64} />
        </Animated.View>
      ) : null}

      <Animated.View style={[styles.wordmark, wordmarkStyle]}>
        <AppText variant="displayAr" align="center">
          طير السعد
        </AppText>
      </Animated.View>

      {showHoldSkeleton && !sessionReady ? (
        <View style={[styles.holdSkeleton, { paddingHorizontal: theme.spacing.xxl }]}>
          <SkeletonBlock lines={2} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlate: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glideBird: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    marginTop: 24,
    alignItems: 'center',
  },
  holdSkeleton: {
    position: 'absolute',
    bottom: 96,
    start: 0,
    end: 0,
  },
});
