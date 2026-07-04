import {
  Amiri_700Bold,
} from '@expo-google-fonts/amiri';
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import {
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  InterTight_400Regular,
  InterTight_500Medium,
  InterTight_700Bold,
} from '@expo-google-fonts/inter-tight';
import { useFonts } from 'expo-font';

export function useAppFonts(): { fontsLoaded: boolean; fontError: Error | null } {
  const [loaded, error] = useFonts({
    Amiri_700Bold,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_700Bold,
    Fraunces_700Bold,
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_700Bold,
  });

  return { fontsLoaded: loaded, fontError: error };
}
