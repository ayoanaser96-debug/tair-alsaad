import { useCallback, useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LocationMapIllustration } from '@/components/location/LocationMapIllustration';
import { AppText } from '@/components/ui/AppText';
import { ThemeButton } from '@/components/ui/ThemeButton';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { authenticatedTabsHref } from '@/lib/loginIntent';
import {
  applyCurrentLocationToPickupDraft,
  isLocationPermanentlyDenied,
  requestForegroundLocationPermission,
} from '@/lib/location/permissionGate';
import { markLocationSkippedThisSession } from '@/lib/location/session';
import { displayVariantForLocale, useTheme } from '@/lib/theme';
import type { AppHomeSegment } from '@/lib/secure';
import { useDraftShipmentStore } from '@/stores/draftShipmentStore';

type LocationPermissionParams = {
  segment?: string;
};

function parseSegment(value: string | undefined): AppHomeSegment {
  if (value === 'receiver' || value === 'driver' || value === 'admin') return value;
  return 'sender';
}

export function LocationPermissionScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<LocationPermissionParams>();
  const segment = parseSegment(typeof params.segment === 'string' ? params.segment : undefined);
  const patchPickup = useDraftShipmentStore((s) => s.patchPickup);

  const [checking, setChecking] = useState(true);
  const [permanentlyDenied, setPermanentlyDenied] = useState(false);
  const [loading, setLoading] = useState(false);

  const continueToDestination = useCallback(() => {
    router.replace(authenticatedTabsHref(segment));
  }, [segment]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const permission = await Location.getForegroundPermissionsAsync();

      if (cancelled) return;

      if (permission.status === Location.PermissionStatus.GRANTED) {
        continueToDestination();
        return;
      }

      if (permission.status !== Location.PermissionStatus.UNDETERMINED) {
        continueToDestination();
        return;
      }

      const blocked = await isLocationPermanentlyDenied();
      if (!cancelled) {
        setPermanentlyDenied(blocked);
        setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [continueToDestination]);

  const applyGrantedLocation = async () => {
    await applyCurrentLocationToPickupDraft(patchPickup);
  };

  const onEnable = async () => {
    if (permanentlyDenied) {
      await Linking.openSettings();
      return;
    }

    setLoading(true);
    try {
      const result = await requestForegroundLocationPermission();
      if (result.granted) {
        await applyGrantedLocation();
        continueToDestination();
        return;
      }
      setPermanentlyDenied(result.permanentlyDenied);
    } finally {
      setLoading(false);
    }
  };

  const onSkip = () => {
    markLocationSkippedThisSession();
    continueToDestination();
  };

  if (checking) {
    return <ThemeScreen warmGradient={false} />;
  }

  return (
    <ThemeScreen>
      <View
        style={[
          styles.layout,
          {
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.xxl,
            gap: theme.spacing.xl,
          },
        ]}
      >
        <LocationMapIllustration />

        <View style={{ gap: theme.spacing.md }}>
          <AppText variant={displayVariantForLocale(i18n.language)} align="center">
            {t('locationPermission.title')}
          </AppText>
          <AppText variant="body" color="inkMuted" align="center">
            {t('locationPermission.body')}
          </AppText>
        </View>

        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          <ThemeButton loading={loading} onPress={() => void onEnable()}>
            {permanentlyDenied ? t('locationPermission.openSettings') : t('locationPermission.enable')}
          </ThemeButton>
          <ThemeButton variant="ghost" disabled={loading} onPress={onSkip}>
            {t('locationPermission.notNow')}
          </ThemeButton>
        </View>
      </View>
    </ThemeScreen>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'center',
  },
});
