import { Redirect, router } from 'expo-router';
import { View } from 'react-native';
import { Page } from '../components/page';
import { Button, Card, Footer, Rows, ScreenHeader, Stripes, T } from '../components/ui';
import { STUDIO, addMin, fmtDate, money, svcOf } from '../lib/data';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

export default function Review() {
  const { draft, form, createBooking } = useStore();
  if (!draft) return <Redirect href="/home" />;
  const sv = svcOf(draft.serviceId);

  const confirm = () => {
    const b = createBooking();
    // The flow is finished: drop it from history so back can't resubmit.
    router.dismissAll();
    router.push({ pathname: '/confirmed', params: { code: b.code } });
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
        <Button label="Confirm booking" height={58} onPress={confirm} />
      </Footer>
    </View>
  );
}
