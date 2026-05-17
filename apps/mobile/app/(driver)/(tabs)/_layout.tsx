import { Fragment } from 'react';

import { useTranslation } from 'react-i18next';

import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useDriverForegroundLocationPing } from '@/hooks/useDriverForegroundLocationPing';
import { useActiveShipmentDriver, useDriverMe } from '@/queries/driver';

function DriverLocationLoop() {
  const { data: driver } = useDriverMe(true);
  const { data: active } = useActiveShipmentDriver();
  const status = typeof driver?.status === 'string' ? driver.status : '';
  const can = status === 'active';
  const online = Boolean(driver?.isOnline);
  useDriverForegroundLocationPing(can && online && Boolean(active));
  return null;
}

export default function DriverTabsLayout() {
  const { t } = useTranslation();

  return (
    <Fragment>
      <DriverLocationLoop />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2F4A5C',
          tabBarInactiveTintColor: '#5C544A',
          tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E8E1D5' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('navigation.requests'),
            tabBarIcon: ({ color, size }) => <Ionicons name="navigate-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="active"
          options={{
            title: t('navigation.active'),
            tabBarIcon: ({ color, size }) => <Ionicons name="car-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="earnings"
          options={{
            title: t('navigation.earnings'),
            tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('navigation.profile'),
            tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
          }}
        />
      </Tabs>
    </Fragment>
  );
}
