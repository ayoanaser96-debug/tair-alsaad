import { Tabs } from 'expo-router';

import { SenderTabBar } from '@/components/navigation/SenderTabBar';

export default function SenderTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <SenderTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="shipments" />
      <Tabs.Screen name="profile" />
      {/* TODO(push): re-enable the notifications tab once push notifications ship.
          Kept as a hidden route so the screen stays compilable. */}
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
