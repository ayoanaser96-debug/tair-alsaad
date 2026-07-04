import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/lib/theme';

// Notifications intentionally excluded this release (TODO(push)).
const VISIBLE_ROUTES = ['index', 'shipments', 'profile'] as const;

type VisibleRoute = (typeof VISIBLE_ROUTES)[number];

const TAB_META: Record<VisibleRoute, { labelKey: string; icon: keyof typeof Ionicons.glyphMap }> = {
  index: { labelKey: 'navigation.home', icon: 'home-outline' },
  shipments: { labelKey: 'navigation.myShipments', icon: 'cube-outline' },
  profile: { labelKey: 'navigation.myAccount', icon: 'person-outline' },
};

const FAB_SIZE = 58;
const FAB_LIFT = 14;
const BAR_HEIGHT = 64;
// Reserve horizontal room for the centered FAB so no tab sits under it.
const FAB_SLOT_WIDTH = FAB_SIZE + 16;

export function SenderTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const visibleRoutes = state.routes.filter((route) =>
    VISIBLE_ROUTES.includes(route.name as VisibleRoute),
  );

  // Split the tabs into two balanced groups around the centered FAB slot.
  const splitAt = Math.ceil(visibleRoutes.length / 2);
  const leftRoutes = visibleRoutes.slice(0, splitAt);
  const rightRoutes = visibleRoutes.slice(splitAt);

  const renderTab = (route: (typeof visibleRoutes)[number]) => {
    const meta = TAB_META[route.name as VisibleRoute];
    const focused = state.index === state.routes.findIndex((r) => r.key === route.key);
    const color = focused ? theme.colors.primary : theme.colors.inkMuted;

    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={
          focused ? t('navigation.tabSelected', { label: t(meta.labelKey) }) : t(meta.labelKey)
        }
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }}
        style={styles.tabSlot}
      >
        <Ionicons name={meta.icon} size={22} color={color} />
        <AppText variant="caption" style={{ color, marginTop: 4 }}>
          {t(meta.labelKey)}
        </AppText>
        <View
          style={[
            styles.activeDot,
            { backgroundColor: focused ? theme.colors.primary : 'transparent' },
          ]}
        />
      </Pressable>
    );
  };

  const openCreateFlow = () => {
    void Haptics.selectionAsync();
    router.push('/(sender)/new');
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.line,
          paddingBottom: insets.bottom,
          height: BAR_HEIGHT + insets.bottom,
          shadowColor: theme.shadow.card.shadowColor,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.group}>{leftRoutes.map(renderTab)}</View>
        <View style={{ width: FAB_SLOT_WIDTH }} />
        <View style={styles.group}>{rightRoutes.map(renderTab)}</View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('sender.home.actionSend')}
        onPress={openCreateFlow}
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom + FAB_LIFT,
            ...theme.shadow.button,
          },
        ]}
      >
        <Ionicons name="paper-plane" size={26} color={theme.colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  group: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabSlot: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
