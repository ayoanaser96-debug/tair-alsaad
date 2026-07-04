import { Pressable, StyleSheet, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import type { SavedAddressRow } from '@/lib/types';
import { useTheme } from '@/lib/theme';

type SavedAddressCardProps = {
  address: SavedAddressRow;
  onEdit: () => void;
  onDelete: () => void;
};

function labelIcon(label: string | undefined): keyof typeof Ionicons.glyphMap {
  const raw = (label ?? '').trim().toLowerCase();
  if (['بيت', 'منزل', 'home', 'house'].some((k) => raw.includes(k))) return 'home-outline';
  if (['شغل', 'مكتب', 'work', 'office'].some((k) => raw.includes(k))) return 'briefcase-outline';
  return 'location-outline';
}

function displayLabel(address: SavedAddressRow, fallback: string): string {
  if (address.label?.trim()) return address.label.trim();
  return fallback;
}

function formatCity(city: string): string {
  const trimmed = city.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function addressLine(address: SavedAddressRow): string {
  const parts = [
    address.area,
    formatCity(address.city),
    address.street,
    address.building,
  ].filter(Boolean);
  return parts.join(' · ');
}

export function SavedAddressCard({ address, onEdit, onDelete }: SavedAddressCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const icon = labelIcon(address.label);
  const title = displayLabel(address, t('shipmentNew.addressDefaultLabel'));
  const line = addressLine(address);

  return (
    <Card style={{ gap: theme.spacing.md }}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <View style={styles.headerText}>
          <AppText variant="bodyBold">{title}</AppText>
          <AppText variant="caption" color="inkMuted">
            {line}
          </AppText>
        </View>
      </View>

      <View style={[styles.actions, { gap: theme.spacing.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('shipmentNew.addressEdit')}
          onPress={onEdit}
          style={[styles.actionBtn, { borderColor: theme.colors.line }]}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
          <AppText variant="caption" color="primary">
            {t('shipmentNew.addressEdit')}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
          onPress={onDelete}
          style={[styles.actionBtn, { borderColor: theme.colors.line }]}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
          <AppText variant="caption" color="danger">
            {t('common.delete')}
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
});
