import { Stack } from 'expo-router';

export default function SenderRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="new" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="history" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="wallet" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="shipments/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="saved-addresses" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
