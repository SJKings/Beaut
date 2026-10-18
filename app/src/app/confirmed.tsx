import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from '../components/icons';
import { useCopyCode } from '../components/toast';
import { Button, Card, Pill, T } from '../components/ui';
import { svcOf, whenLabel } from '../lib/data';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

export default function Confirmed() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const b = useStore().bookings[code];
  const copy = useCopyCode();
  const insets = useSafeAreaInsets();
  if (!b) return <Redirect href="/home" />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 40, paddingHorizontal: 24, paddingBottom: Math.max(36, insets.bottom + 8), alignItems: 'center', gap: 18 }}
    >
      <StatusBar style="dark" />
      <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' }}>
        <Check />
      </View>
      <T w={600} style={{ fontSize: 28, letterSpacing: -0.56, textAlign: 'center' }}>
        You're booked
      </T>
      <T style={{ fontSize: 15, lineHeight: 22, color: colors.muted2, maxWidth: 290, textAlign: 'center' }}>
        Keep this code. It's how you'll find, change or cancel your booking.
      </T>
      <View
        style={{
          alignSelf: 'stretch',
          marginTop: 6,
          paddingVertical: 22,
          paddingHorizontal: 16,
          borderRadius: 24,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.pinkDashed,
          backgroundColor: colors.pinkWash,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <T w={600} style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.pinkDark }}>
          Booking code
        </T>
        <T mono w={600} selectable style={{ fontSize: 36, letterSpacing: 2.9 }}>
          {b.code}
        </T>
        <T w={600} style={{ fontSize: 15 }}>
          {b.name}
        </T>
        <T style={{ fontSize: 13, color: colors.muted2 }}>{b.phone}</T>
        <Pill label="Copy code" onPress={() => copy(b.code)} style={{ marginTop: 4 }} />
      </View>
      <Card style={{ alignSelf: 'stretch', gap: 4, padding: 16, borderRadius: 20 }}>
        <T w={600} style={{ fontSize: 15 }}>
          {svcOf(b.serviceId).name}
        </T>
        <T style={{ fontSize: 13, color: colors.muted }}>
          {whenLabel(b)} · {b.spec}
        </T>
      </Card>
      <T style={{ fontSize: 13, color: colors.muted3, textAlign: 'center' }}>
        {b.email ? 'A copy was sent to ' + b.email : 'Screenshot or copy it. There is no account to recover it from.'}
      </T>
      <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 'auto' }}>
        <Button label="View booking" onPress={() => router.replace({ pathname: '/booking/[code]', params: { code: b.code } })} />
        <Button
          label="Back to home"
          kind="outline"
          onPress={() => {
            router.dismissAll();
            router.navigate('/home');
          }}
        />
      </View>
    </ScrollView>
  );
}
