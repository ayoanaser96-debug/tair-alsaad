import { Stack } from 'expo-router';

export default function ReceiverRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tracking/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
