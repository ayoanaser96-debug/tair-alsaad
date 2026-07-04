import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { WelcomeIllustration } from '@/components/welcome/WelcomeIllustration';
import { AppText } from '@/components/ui/AppText';
import { ThemeButton } from '@/components/ui/ThemeButton';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { displayVariantForLocale, useTheme } from '@/lib/theme';

const STAGGER_MS = 80;

export function WelcomeScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const reduced = useReducedMotion();

  const illustrationOpacity = useSharedValue(reduced ? 1 : 0);
  const headlineOpacity = useSharedValue(reduced ? 1 : 0);
  const subtitleOpacity = useSharedValue(reduced ? 1 : 0);
  const ctaOpacity = useSharedValue(reduced ? 1 : 0);
  const linkOpacity = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;

    const fadeIn = (delay: number) =>
      withDelay(delay, withTiming(1, { duration: 350 }));

    illustrationOpacity.value = fadeIn(0);
    headlineOpacity.value = fadeIn(STAGGER_MS);
    subtitleOpacity.value = fadeIn(STAGGER_MS * 2);
    ctaOpacity.value = fadeIn(STAGGER_MS * 3);
    linkOpacity.value = fadeIn(STAGGER_MS * 4);
  }, [
    ctaOpacity,
    headlineOpacity,
    illustrationOpacity,
    linkOpacity,
    reduced,
    subtitleOpacity,
  ]);

  const illustrationStyle = useAnimatedStyle(() => ({ opacity: illustrationOpacity.value }));
  const headlineStyle = useAnimatedStyle(() => ({ opacity: headlineOpacity.value }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));
  const linkStyle = useAnimatedStyle(() => ({ opacity: linkOpacity.value }));

  return (
    <ThemeScreen>
      <View style={styles.layout}>
        <Animated.View style={[styles.illustrationArea, illustrationStyle]}>
          <WelcomeIllustration />
        </Animated.View>

        <View style={[styles.content, { paddingHorizontal: theme.spacing.xl, gap: theme.spacing.lg }]}>
          <Animated.View style={headlineStyle}>
            <AppText variant={displayVariantForLocale(i18n.language)} align="center">
              {t('welcome.headline')}
            </AppText>
          </Animated.View>

          <Animated.View style={subtitleStyle}>
            <AppText variant="body" color="inkMuted" align="center">
              {t('welcome.subtitle')}
            </AppText>
          </Animated.View>

          <Animated.View style={[ctaStyle, { marginTop: theme.spacing.sm }]}>
            <ThemeButton onPress={() => router.push('/(auth)/login')}>
              {t('welcome.getStarted')}
            </ThemeButton>
          </Animated.View>

          <Animated.View style={linkStyle}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(auth)/login')}
              style={styles.signInLink}
            >
              <AppText variant="body" color="primary" align="center">
                {t('welcome.signIn')}
              </AppText>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </ThemeScreen>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
  },
  illustrationArea: {
    flex: 0.55,
    minHeight: 280,
  },
  content: {
    flex: 0.45,
    justifyContent: 'flex-start',
    paddingBottom: 24,
  },
  signInLink: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
