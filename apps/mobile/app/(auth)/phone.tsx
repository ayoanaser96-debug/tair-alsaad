import { Redirect } from 'expo-router';

export default function PhoneRedirectScreen() {
  return <Redirect href="/(auth)/login" />;
}
