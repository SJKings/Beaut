import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import { Page } from '../../components/page';
import { Card, Pill, StatusBadge, T, textStyles } from '../../components/ui';
import { svcOf, whenLabel } from '../../lib/data';
import { openBooking } from '../../lib/nav';
import { useSavedBookings, useStore } from '../../lib/store';
import { colors, statusColors } from '../../lib/theme';

export default function Bookings() {
  const { setExplore, seen, refreshBookings } = useStore();
  const saved = useSavedBookings();

  useFocusEffect(
    useCallback(() => {
      refreshBookings(seen);
    }, [seen, refreshBookings]),
  );

  return (
    <Page gap={16}>
      <T w={600} style={textStyles.pageTitle}>
        Bookings
      </T>
      <T style={{ fontSize: 14, lineHeight: 21, color: colors.muted2 }}>Bookings made or looked up on this device. On another phone, use your code.</T>
      {saved.length === 0 && (
        <Card style={{ paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center', gap: 12 }}>
          <T w={600} style={{ fontSize: 15 }}>
            Nothing here yet
          </T>
          <Pill
            label="Browse services"
            bg={colors.pink}
            size={14}
            px={20}
            py={11}
            onPress={() => {
              setExplore({ cat: 'All', q: '' });
              router.navigate('/explore');
            }}
          />
        </Card>
      )}
      {saved.map((b) => {
        const sc = statusColors(b.status);
        return (
          <Card key={b.code} onPress={() => openBooking(b.code)} style={{ gap: 10, padding: 16, opacity: b.status === 'Cancelled' ? 0.6 : 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T mono w={600} style={{ fontSize: 14, color: colors.pink }}>
                {b.code}
              </T>
              <StatusBadge small status={b.status} bg={sc.bg} fg={sc.fg} />
            </View>
            <T w={600} style={{ fontSize: 16 }}>
              {svcOf(b.serviceId).name}
            </T>
            <T style={{ fontSize: 13, color: colors.muted }}>
              {whenLabel(b)} · {b.spec}
            </T>
            <T style={{ fontSize: 13, color: colors.body }}>
              {b.name} · {b.phone}
            </T>
          </Card>
        );
      })}
    </Page>
  );
}
