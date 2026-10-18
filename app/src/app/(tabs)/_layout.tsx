import { Tabs } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavBookings, NavCode, NavExplore, NavHome } from '../../components/icons';
import { T } from '../../components/ui';
import { colors } from '../../lib/theme';

const ITEMS: Record<string, { label: string; Icon: typeof NavHome }> = {
  home: { label: 'Home', Icon: NavHome },
  explore: { label: 'Explore', Icon: NavExplore },
  find: { label: 'Code', Icon: NavCode },
  bookings: { label: 'Bookings', Icon: NavBookings },
};

type BarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

/** Floating dark pill nav from the design: active tab expands into a white pill with a pink label. */
function TabBar({ state, navigation }: BarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: Math.max(16, insets.bottom - 8),
        height: 68,
        borderRadius: 999,
        backgroundColor: colors.ink,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        shadowColor: colors.ink,
        shadowOpacity: 0.5,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 14 },
        elevation: 12,
      }}
    >
      {state.routes.map((route, i) => {
        const item = ITEMS[route.name];
        if (!item) return null;
        const active = state.index === i;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            style={{
              height: 52,
              borderRadius: 999,
              backgroundColor: active ? '#fff' : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingLeft: 6,
              paddingRight: active ? 18 : 6,
            }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: active ? colors.pink : '#2E2729', alignItems: 'center', justifyContent: 'center' }}>
              <item.Icon />
            </View>
            {active && (
              <T w={600} style={{ fontSize: 14, color: colors.pink }}>
                {item.label}
              </T>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...(props as unknown as BarProps)} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="find" />
      <Tabs.Screen name="bookings" />
    </Tabs>
  );
}
