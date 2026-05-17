import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';

export default function SenderWalletPlaceholderScreen() {
  const { t } = useTranslation();

  return (
    <Screen className="justify-center px-6 pb-28 pt-8">
      <Text className="text-center text-2xl font-bold text-ink">{t('sender.walletComingTitle')}</Text>
      <Text className="mt-4 text-center text-base leading-7 text-inkSoft">{t('sender.walletComingBody')}</Text>
      <View className="mt-10 rounded-2xl border border-border bg-bg px-5 py-6">
        <Text className="text-center text-sm leading-6 text-inkSoft">{t('sender.walletFootnote')}</Text>
      </View>
    </Screen>
  );
}
