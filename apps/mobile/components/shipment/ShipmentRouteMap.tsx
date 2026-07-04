import { useEffect, useRef } from 'react';

import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import type MapViewRN from 'react-native-maps';

import { useTheme } from '@/lib/theme';

type MarkerDragEndEvt = {
  nativeEvent: { coordinate: { latitude: number; longitude: number } };
};

export type Coord = { lat: number; lng: number };

type Props = {
  pickup: Coord;
  dropoff: Coord;
  driver?: Coord | null;
  /** Omit drop marker + line (pickup-focused step). */
  showRoute?: boolean;
  /** When set, that pin can be dragged; `onMove` fires with updated coord. */
  draggable?: 'pickup' | 'dropoff';
  onMove?: (which: 'pickup' | 'dropoff', c: Coord) => void;
  height?: number;
  pickupPinColor?: string;
  dropoffPinColor?: string;
};

export function ShipmentRouteMap(props: Props) {
  const theme = useTheme();
  const { pickup, dropoff, driver, draggable, onMove, height = 260, showRoute = true } = props;
  const pickupPinColor = props.pickupPinColor ?? theme.colors.primary;
  const dropoffPinColor = props.dropoffPinColor ?? theme.colors.accent;
  const mapRef = useRef<MapViewRN>(null);

  useEffect(() => {
    const coords = [{ latitude: pickup.lat, longitude: pickup.lng }];
    if (showRoute) coords.push({ latitude: dropoff.lat, longitude: dropoff.lng });
    if (driver) coords.push({ latitude: driver.lat, longitude: driver.lng });

    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 48, bottom: 48, left: 48, right: 48 },
      animated: false,
    });
  }, [dropoff.lat, dropoff.lng, driver?.lat, driver?.lng, pickup.lat, pickup.lng, showRoute]);

  const line = showRoute
    ? [{ latitude: pickup.lat, longitude: pickup.lng }, { latitude: dropoff.lat, longitude: dropoff.lng }]
    : [];

  return (
    <View className="overflow-hidden rounded-2xl border border-border" style={{ height }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: pickup.lat,
          longitude: pickup.lng,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }}
      >
        <Marker
          coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
          pinColor={pickupPinColor}
          draggable={draggable === 'pickup'}
          onDragEnd={(e: MarkerDragEndEvt) =>
            onMove?.('pickup', { lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })
          }
        />
        {showRoute ? (
          <Marker
            coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
            pinColor={dropoffPinColor}
            draggable={draggable === 'dropoff'}
            onDragEnd={(e: MarkerDragEndEvt) =>
              onMove?.('dropoff', { lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })
            }
          />
        ) : null}
        {driver ? (
          <Marker
            coordinate={{ latitude: driver.lat, longitude: driver.lng }}
            pinColor={theme.colors.success}
            opacity={0.95}
          />
        ) : null}
        {line.length > 1 ? (
          <Polyline coordinates={line} strokeColor={pickupPinColor} strokeWidth={3} lineDashPattern={[6, 4]} />
        ) : null}
      </MapView>
    </View>
  );
}
