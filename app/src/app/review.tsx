import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Page } from '../components/page';
import { ApiError, SlotTakenError } from '../lib/api';
import { useToast } from '../components/toast';
import { Button, Card, Footer, Rows, ScreenHeader, T } from '../components/ui';
import { addMin, fmtDate } from '../lib/data';
import { useCatalog, useStore } from '../lib/store';
import { colors } from '../lib/theme';
import { ServiceArt } from '../components/art';

export default function Review() {
  const { draft, form, createBooking } = useStore();
  const flash = useToast();
  const { svcOf, studio, money } = useCatalog();
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
    } catch (e) {
      setSending(false);
      if (e instanceof SlotTakenError) {
        flash(e.message);
        // Back to the time picker, which reloads what's still free.
        router.dismissTo({ pathname: '/service/[id]', params: { id: draft.serviceId } });
      } else flash(e instanceof ApiError ? e.message : "Couldn't send your booking. Check your connection and try again.");
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
          <ServiceArt id={sv.id} cat={sv.cat} style={{ width: 68, height: 68 }} />
          <View style={{ flex: 1, gap: 4 }}>
            <T w={600} style={{ fontSize: 16 }}>
              {sv.name}
            </T>
            <T w={500} style={{ fontSize: 13, color: colors.pink }}>
              {studio.name}
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
