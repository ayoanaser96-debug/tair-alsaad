import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';

export default function SenderSendTabScreen() {
  const { t } = useTranslation();

  return (
    <Screen className="justify-start px-5 pt-10 pb-28">
      <Text className="text-2xl font-bold text-ink">{t('sender.sendTabTitle')}</Text>
      <Text className="mt-4 text-base leading-7 text-inkSoft">{t('sender.sendTabSubtitle')}</Text>
      <View className="mt-12 gap-4">
        <Button containerClassName="w-full" onPress={() => router.push('/(sender)/new')}>
          {t('sender.newShipment')}
        </Button>
        <Button variant="secondary" containerClassName="w-full" onPress={() => router.push('/(sender)/wallet')}>
          {t('navigation.wallet')}
        </Button>
      </View>
    </Screen>
  );
}
