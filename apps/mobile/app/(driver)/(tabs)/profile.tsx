import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';

import { Link } from 'expo-router';

import { SharedProfileScreen } from '@/components/authenticated/SharedProfileScreen';

export default function DriverProfileTab() {
  const { t } = useTranslation();

  return (
    <SharedProfileScreen
      prepend={
        <Link href="/(driver)/apply" asChild>
          <Pressable className="rounded-xl bg-surface px-4 py-4">
            <Text className="text-base font-medium text-ink">{t('driver.applyTitle')}</Text>
          </Pressable>
        </Link>
      }
    />
  );
}
