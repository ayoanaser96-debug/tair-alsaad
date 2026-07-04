import type { ShipmentStatus } from '@tayralsaad/types';
import { StyleSheet, View } from 'react-native';

import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { BirdMotif } from '@/components/ui/BirdMotif';
import { AppText } from '@/components/ui/AppText';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/lib/theme';

const STEPS = ['created', 'pickedUp', 'inTransit', 'delivered'] as const;

export function shipmentProgressIndex(status: ShipmentStatus): number {
  if (status === 'delivered') return 3;
  if (status === 'in_transit' || status === 'arrived_dropoff') return 2;
  if (status === 'picked_up' || status === 'arrived_pickup') return 1;
  return 0;
}

type ShipmentProgressBirdProps = {
  status: ShipmentStatus;
  labels: Record<(typeof STEPS)[number], string>;
};

export function ShipmentProgressBird({ status, labels }: ShipmentProgressBirdProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const step = shipmentProgressIndex(status);
  const progress = useSharedValue(step / (STEPS.length - 1));

  useEffect(() => {
    const next = step / (STEPS.length - 1);
    progress.value = reduced ? next : withTiming(next, { duration: 250 });
  }, [progress, reduced, step]);

  const birdStyle = useAnimatedStyle(() => ({
    left: `${progress.value * 100}%`,
  }));

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={[styles.track, { backgroundColor: theme.colors.line }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: theme.colors.primary,
              width: `${(step / (STEPS.length - 1)) * 100}%`,
            },
          ]}
        />
        <Animated.View style={[styles.birdWrap, birdStyle]}>
          <BirdMotif size={28} />
        </Animated.View>
      </View>
      <View style={styles.labels}>
        {STEPS.map((key, index) => (
          <AppText
            key={key}
            variant="caption"
            color={index <= step ? 'primary' : 'inkMuted'}
            align="center"
            style={{ flex: 1 }}
          >
            {labels[key]}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'visible',
    marginTop: 28,
    marginBottom: 8,
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
  birdWrap: {
    position: 'absolute',
    top: -22,
    marginStart: -14,
  },
  labels: {
    flexDirection: 'row',
    gap: 4,
  },
});
