import * as Location from 'expo-location';

import { wasLocationSkippedThisSession } from '@/lib/location/session';

export async function shouldShowLocationPrePrompt(): Promise<boolean> {
  if (wasLocationSkippedThisSession()) return false;

  const permission = await Location.getForegroundPermissionsAsync();
  return permission.status === Location.PermissionStatus.UNDETERMINED;
}

export async function isLocationPermanentlyDenied(): Promise<boolean> {
  const permission = await Location.getForegroundPermissionsAsync();
  return (
    permission.status === Location.PermissionStatus.DENIED && permission.canAskAgain === false
  );
}

export async function requestForegroundLocationPermission(): Promise<{
  granted: boolean;
  permanentlyDenied: boolean;
}> {
  const result = await Location.requestForegroundPermissionsAsync();
  return {
    granted: result.status === Location.PermissionStatus.GRANTED,
    permanentlyDenied:
      result.status === Location.PermissionStatus.DENIED && result.canAskAgain === false,
  };
}

export async function applyCurrentLocationToPickupDraft(
  patchPickup: (patch: { location: { lat: number; lng: number } }) => void,
): Promise<void> {
  const permission = await Location.getForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) return;

  const position = await Location.getCurrentPositionAsync({});
  patchPickup({
    location: {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    },
  });
}
