import type { ShipmentStatus } from '@tayralsaad/types';
import type { TFunction } from 'i18next';

import { Text, View } from 'react-native';

type Entry = {
  status: ShipmentStatus;
  at?: string | Date;
};

type Props = {
  items: Entry[];
  t: TFunction;
};

/** Renders chronological status history (localized labels). */
export function StatusTimeline(props: Props) {
  const { items, t } = props;

  const sorted = [...items].sort((a, b) => {
    const tb = typeof b.at === 'string' ? new Date(b.at).getTime() : b.at instanceof Date ? b.at.getTime() : 0;
    const ta = typeof a.at === 'string' ? new Date(a.at).getTime() : a.at instanceof Date ? a.at.getTime() : 0;
    return ta - tb;
  });

  const visible = [...sorted].reverse();

  return (
    <View className="gap-3">
      {visible.map((row, ix) => {
        const stamp =
          typeof row.at === 'string' ? new Date(row.at) : row.at instanceof Date ? row.at : new Date(NaN);
        const readable = Number.isFinite(stamp.getTime())
          ? `${stamp.toLocaleDateString()} ${stamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : '—';

        return (
          <View key={`${String(row.status)}-${ix}-${readable}`} className="flex-row gap-3">
            <View className="mt-1 h-4 w-4 rounded-full border-4 border-primary" />
            <View className="flex-1">
              <Text className="text-base font-semibold text-ink">{t(`status.${row.status}`)}</Text>
              <Text className="mt-1 text-xs text-inkSoft">{readable}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
