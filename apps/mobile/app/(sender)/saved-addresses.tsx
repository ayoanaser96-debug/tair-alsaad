import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';

import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CreateFlowHeader } from '@/components/sender/create/CreateFlowHeader';
import { SavedAddressCard } from '@/components/sender/SavedAddressCard';
import { SavedAddressSkeleton } from '@/components/sender/SavedAddressSkeleton';
import { ShipmentRouteMap } from '@/components/shipment/ShipmentRouteMap';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ThemeBottomSheet } from '@/components/ui/ThemeBottomSheet';
import { ThemeButton } from '@/components/ui/ThemeButton';
import { ThemeInput } from '@/components/ui/ThemeInput';
import { ThemeScreen } from '@/components/ui/ThemeScreen';
import { resolveAddressError } from '@/lib/addressErrors';
import type { SavedAddressRow } from '@/lib/types';
import { useTheme } from '@/lib/theme';
import {
  useAddSavedAddressMutation,
  useDeleteSavedAddressMutation,
  useMe,
  useUpdateSavedAddressMutation,
} from '@/queries/me';

const DEFAULT_CENTER = { lat: 33.3152, lng: 44.3661 };

function fillFormFromAddress(
  addr: SavedAddressRow,
  setters: {
    setLabel: (v: string) => void;
    setCity: (v: string) => void;
    setArea: (v: string) => void;
    setStreet: (v: string) => void;
    setBuilding: (v: string) => void;
    setNotes: (v: string) => void;
    setLoc: (v: { lat: number; lng: number }) => void;
  },
) {
  setters.setLabel(addr.label ?? '');
  setters.setCity(addr.city);
  setters.setArea(addr.area);
  setters.setStreet(addr.street ?? '');
  setters.setBuilding(addr.building ?? '');
  setters.setNotes(addr.notes ?? '');
  setters.setLoc(addr.location);
}

export default function SavedAddressesScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data: me, isPending, isError, refetch } = useMe();
  const addMut = useAddSavedAddressMutation();
  const delMut = useDeleteSavedAddressMutation();
  const updateMut = useUpdateSavedAddressMutation();

  const showAddressError = useCallback(
    (error: unknown, retry?: () => void) => {
      const { key, retryable } = resolveAddressError(error);
      if (retryable && retry) {
        Alert.alert(t('common.errorTitle'), t(key), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.retry'), onPress: retry },
        ]);
      } else {
        Alert.alert(t('common.errorTitle'), t(key));
      }
    },
    [t],
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SavedAddressRow | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [label, setLabel] = useState('');
  const [city, setCity] = useState('baghdad');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [notes, setNotes] = useState('');
  const [loc, setLoc] = useState(DEFAULT_CENTER);

  const resetForm = useCallback(() => {
    setLabel('');
    setCity('baghdad');
    setArea('');
    setStreet('');
    setBuilding('');
    setNotes('');
    setLoc(DEFAULT_CENTER);
    setEditingId(null);
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setSheetOpen(true);
  }, [resetForm]);

  const openEdit = useCallback(
    (addr: SavedAddressRow) => {
      fillFormFromAddress(addr, {
        setLabel,
        setCity,
        setArea,
        setStreet,
        setBuilding,
        setNotes,
        setLoc,
      });
      setEditingId(addr.serverId);
      setSheetOpen(true);
    },
    [],
  );

  async function fillGps() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.errorTitle'), t('shipmentNew.permissionLocation'));
      return;
    }
    const cur = await Location.getCurrentPositionAsync({});
    setLoc({ lat: cur.coords.latitude, lng: cur.coords.longitude });
  }

  async function submitSave() {
    if (!city.trim() || !area.trim()) {
      Alert.alert(t('common.errorTitle'), t('shipmentNew.addressRequired'));
      return;
    }
    const payload = {
      city: city.trim().toLowerCase(),
      area: area.trim(),
      location: loc,
      ...(label.trim() ? { label: label.trim() } : {}),
      ...(street.trim() ? { street: street.trim() } : {}),
      ...(building.trim() ? { building: building.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };
    try {
      if (editingId) {
        await updateMut.mutateAsync({ serverId: editingId, patch: payload });
      } else {
        await addMut.mutateAsync(payload);
      }
      Alert.alert('', t('shipmentNew.addressSaved'));
      setSheetOpen(false);
      resetForm();
    } catch (error) {
      showAddressError(error, () => void submitSave());
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await delMut.mutateAsync(deleteTarget.serverId);
      setDeleteTarget(null);
    } catch (error) {
      showAddressError(error, () => void confirmDelete());
    }
  }

  const rows = me?.defaultAddresses ?? [];

  return (
    <ThemeScreen edges={['top']}>
      <CreateFlowHeader title={t('shipmentNew.addressesTitle')} onBack={() => router.back()} />

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending ? (
        <View style={{ padding: theme.spacing.xl }}>
          <SavedAddressSkeleton />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.xxxl,
            gap: theme.spacing.lg,
          }}
        >
          <AppText variant="body" color="inkMuted">
            {t('shipmentNew.addressesSubtitle')}
          </AppText>

          <ThemeButton variant="secondary" onPress={openAdd}>
            {t('shipmentNew.addAddress')}
          </ThemeButton>

          {rows.length === 0 ? (
            <EmptyState
              title={t('shipmentNew.addressEmptyTitle')}
              subtitle={t('shipmentNew.addressEmptySubtitle')}
              actionLabel={t('shipmentNew.addAddress')}
              onAction={openAdd}
            />
          ) : (
            <View style={{ gap: theme.spacing.md }}>
              {rows.map((addr) => (
                <SavedAddressCard
                  key={addr.serverId}
                  address={addr}
                  onEdit={() => openEdit(addr)}
                  onDelete={() => setDeleteTarget(addr)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <ThemeBottomSheet
        visible={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t('shipmentNew.addressDeleteTitle')}
        subtitle={t('shipmentNew.addressDeleteBody')}
      >
        <View style={{ gap: theme.spacing.md }}>
          <ThemeButton variant="danger" loading={delMut.isPending} onPress={() => void confirmDelete()}>
            {t('common.delete')}
          </ThemeButton>
          <ThemeButton variant="ghost" onPress={() => setDeleteTarget(null)}>
            {t('common.cancel')}
          </ThemeButton>
        </View>
      </ThemeBottomSheet>

      <Modal visible={sheetOpen} animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <ThemeScreen edges={['top', 'bottom']}>
          <CreateFlowHeader
            title={editingId ? t('shipmentNew.addressEdit') : t('shipmentNew.addAddress')}
            onClose={() => {
              setSheetOpen(false);
              resetForm();
            }}
          />
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={8}
          >
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: theme.spacing.xl,
                paddingBottom: theme.spacing.xxxl,
                gap: theme.spacing.lg,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <ShipmentRouteMap
                showRoute={false}
                pickup={loc}
                dropoff={loc}
                height={220}
                draggable="pickup"
                onMove={(_which, coord) => setLoc(coord)}
              />

              <ThemeButton variant="secondary" onPress={() => void fillGps()}>
                {t('shipmentNew.useLocation')}
              </ThemeButton>

              <ThemeInput label={t('shipmentNew.addressOptionalLabel')} value={label} onChangeText={setLabel} />
              <ThemeInput label={t('shipmentNew.city')} value={city} onChangeText={setCity} />
              <ThemeInput label={t('shipmentNew.area')} value={area} onChangeText={setArea} />
              <ThemeInput label={t('shipmentNew.street')} value={street} onChangeText={setStreet} />
              <ThemeInput label={t('shipmentNew.building')} value={building} onChangeText={setBuilding} />
              <ThemeInput label={t('shipmentNew.notes')} value={notes} onChangeText={setNotes} multiline />

              <ThemeButton loading={addMut.isPending || updateMut.isPending} onPress={() => void submitSave()}>
                {t('common.save')}
              </ThemeButton>
            </ScrollView>
          </KeyboardAvoidingView>
        </ThemeScreen>
      </Modal>
    </ThemeScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
