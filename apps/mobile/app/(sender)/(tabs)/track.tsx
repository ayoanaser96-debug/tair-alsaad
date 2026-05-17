import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';

export default function SenderTrackTabScreen() {
  const { t } = useTranslation();

  return (
    <Screen className="justify-start px-5 pt-10 pb-28">
      <Text className="text-2xl font-bold text-ink">{t('navigation.track')}</Text>
      <Text className="mt-4 text-base leading-7 text-inkSoft">{t('sender.trackTabSubtitle')}</Text>
      <View className="mt-12">
        <Button containerClassName="w-full" onPress={() => router.push('/receiver-track')}>
          {t('sender.trackTabOpen')}
        </Button>
      </View>
    </Screen>
  );
}
