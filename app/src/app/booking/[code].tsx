import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Page } from '../../components/page';
import { useCopyCode, useToast } from '../../components/toast';
import { Button, Card, Pill, Rows, ScreenHeader, StatusBadge, Stripes, T } from '../../components/ui';
import { ApiError } from '../../lib/api';
import { addMin, fmtDate, money, whenLabel } from '../../lib/data';
import { openService } from '../../lib/nav';
import { useCatalog, useStore } from '../../lib/store';
import { colors, statusColors } from '../../lib/theme';

export default function BookingDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { bookings, cancelBooking, refreshBookings, remember } = useStore();
  const copy = useCopyCode();
  const { svcOf, studio } = useCatalog();
  const flash = useToast();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const b = bookings[code];

  useEffect(() => {
    if (b) remember(b.code);
  }, [b?.code]);

  // Status changes made by the studio (check-in, completed…) show up here.
  useFocusEffect(
    useCallback(() => {
      refreshBookings([code]);
    }, [code, refreshBookings]),
  );

  if (!b) return <Redirect href="/find" />;
  const sv = svcOf(b.serviceId);
  const sc = statusColors(b.status);

  const doCancel = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await cancelBooking(b.code);
      setSheet(false);
      flash('Booking cancelled');
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "Couldn't cancel. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Page top={8} bottom={36}>
        <ScreenHeader title="Your booking" right={<StatusBadge status={b.status} bg={sc.bg} fg={sc.fg} />} />
        <View style={{ padding: 18, borderRadius: 24, backgroundColor: colors.ink, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 4, flexShrink: 1 }}>
            <T style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.onDarkMuted }}>Booking code</T>
            <T mono w={600} selectable style={{ fontSize: 26, letterSpacing: 2.1, color: colors.pinkLight }}>
              {b.code}
            </T>
            <T w={600} style={{ fontSize: 15, color: '#fff', marginTop: 6 }}>
              {b.name}
            </T>
            <T style={{ fontSize: 13, color: colors.onDarkMuted }}>{b.phone}</T>
          </View>
          <Pill label="Copy" onPress={() => copy(b.code)} bg="transparent" border={colors.body} w={500} px={16} py={9} />
        </View>
        <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 12 }}>
          <Stripes radius={16} style={{ width: 68, height: 68 }} />
          <View style={{ flex: 1, gap: 4 }}>
            <T w={600} style={{ fontSize: 16 }}>
              {sv.name}
            </T>
            <T w={500} style={{ fontSize: 13, color: colors.pink }}>
              {studio.name}
            </T>
          </View>
          <T w={700} style={{ fontSize: 16, paddingRight: 6 }}>
            {money(sv.price)}
          </T>
        </Card>
        <Rows
          rows={[
            { k: 'Date', v: fmtDate(b.date) },
            { k: 'Time', v: b.time + ' – ' + addMin(b.time, sv.dur) },
            { k: 'Specialist', v: b.spec },
            { k: 'Guest', v: b.name },
            { k: 'Phone', v: b.phone },
            { k: 'Payment', v: 'Pay at the studio' },
          ]}
        />
        {b.status === 'Confirmed' && (
          <View style={{ gap: 10 }}>
            <Button label="Reschedule" onPress={() => router.push({ pathname: '/service/[id]', params: { id: b.serviceId, reschedule: b.code } })} />
            <Button label="Cancel booking" kind="outline" fg={colors.danger} onPress={() => setSheet(true)} />
          </View>
        )}
        {b.status === 'Cancelled' && <Button label="Book this again" kind="dark" onPress={() => openService(b.serviceId)} />}
      </Page>

      <Modal visible={sheet} transparent animationType="fade" onRequestClose={() => setSheet(false)} statusBarTranslucent>
        <Pressable onPress={() => setSheet(false)} style={{ flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end' }}>
          <Pressable
            onPress={() => {}}
            style={{ backgroundColor: colors.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 14, paddingHorizontal: 22, paddingBottom: Math.max(34, insets.bottom + 8), gap: 14 }}
          >
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.sheetHandle, alignSelf: 'center' }} />
            <T w={600} style={{ fontSize: 20 }}>
              Cancel this booking?
            </T>
            <T style={{ fontSize: 14, lineHeight: 21, color: colors.muted2 }}>
              {sv.name} on {whenLabel(b)}. The slot will be released and code {b.code} will show as cancelled.
            </T>
            <Button label={busy ? 'Cancelling…' : 'Yes, cancel booking'} kind={busy ? 'disabled' : 'danger'} onPress={doCancel} />
            <Button label="Keep it" kind="ghost" height={52} size={15} onPress={() => setSheet(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
