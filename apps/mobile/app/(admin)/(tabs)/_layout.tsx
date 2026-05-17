import { useTranslation } from 'react-i18next';

import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function AdminTabsLayout() {
  const { t } = useTranslation();

  return (
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
          title: t('admin.tabs.dashboard'),
          tabBarIcon: ({ color, size }) => <Ionicons name="speedometer-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: t('admin.tabs.users'),
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="drivers"
        options={{
          title: t('admin.tabs.drivers'),
          tabBarIcon: ({ color, size }) => <Ionicons name="car-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('admin.tabs.reports'),
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="shipments" options={{ href: null }} />
      <Tabs.Screen name="disputes" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
