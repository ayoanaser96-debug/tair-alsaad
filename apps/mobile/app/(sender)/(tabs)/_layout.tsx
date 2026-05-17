import { useTranslation } from 'react-i18next';

import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function SenderTabsLayout() {
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
          title: t('navigation.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          title: t('navigation.send'),
          tabBarIcon: ({ color, size }) => <Ionicons name="paper-plane-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: t('navigation.track'),
          tabBarIcon: ({ color, size }) => <Ionicons name="navigate-outline" color={color} size={size} />,
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
  );
}
