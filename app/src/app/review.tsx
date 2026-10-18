import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Page } from '../components/page';
import { useToast } from '../components/toast';
import { Button, Card, Footer, Rows, ScreenHeader, Stripes, T } from '../components/ui';
import { STUDIO, addMin, fmtDate, money, svcOf } from '../lib/data';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

export default function Review() {
  const { draft, form, createBooking } = useStore();
  const flash = useToast();
  const [sending, setSending] = useState(false);
  if (!draft) return <Redirect href="/home" />;
  const sv = svcOf(draft.serviceId);

  const confirm = async () => {
    if (sending) return;
    setSending(true);
    try {
      const b = await createBooking();
      // The flow is finished: drop it from history so back can't resubmit.
      router.dismissAll();
      router.push({ pathname: '/confirmed', params: { code: b.code } });
    } catch {
      setSending(false);
      flash("Couldn't send your booking. Check your connection and try again.");
    }
  };

  const line = (k: string, v: string, total?: boolean) => (
    <View
      style={[
        { flexDirection: 'row', justifyContent: 'space-between' },
        total && { paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.divider },
      ]}
    >
      <T w={total ? 700 : 400} style={{ fontSize: total ? 17 : 14, color: total ? colors.ink : colors.muted }}>
        {k}
      </T>
      <T w={total ? 700 : 400} style={{ fontSize: total ? 17 : 14 }}>
        {v}
      </T>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Page top={8} bottom={24}>
        <ScreenHeader title="Review & confirm" />
        <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 12 }}>
          <Stripes radius={16} style={{ width: 68, height: 68 }} />
          <View style={{ flex: 1, gap: 4 }}>
            <T w={600} style={{ fontSize: 16 }}>
              {sv.name}
            </T>
            <T w={500} style={{ fontSize: 13, color: colors.pink }}>
              {STUDIO.name}
            </T>
          </View>
        </Card>
        <Rows
          rows={[
            { k: 'Date', v: fmtDate(draft.date) },
            { k: 'Time', v: draft.time + ' – ' + addMin(draft.time, sv.dur) },
            { k: 'Duration', v: sv.dur + ' min' },
            { k: 'Specialist', v: draft.spec },
            { k: 'Guest', v: form.name },
            { k: 'Phone', v: form.phone },
          ]}
        />
        <Card style={{ gap: 10, padding: 16 }}>
          {line('Service', money(sv.price))}
          {line('Payment', 'Pay at the studio')}
          {line('Total', money(sv.price), true)}
        </Card>
      </Page>
      <Footer>
        <Button label={sending ? 'Booking…' : 'Confirm booking'} kind={sending ? 'disabled' : 'primary'} height={58} onPress={confirm} />
      </Footer>
    </View>
  );
}
