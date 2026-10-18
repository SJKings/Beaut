import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Page } from '../../components/page';
import { Button, Card, T, textStyles } from '../../components/ui';
import { ApiError, hasBackend } from '../../lib/api';
import { DEMO_CODE, normalizeCode } from '../../lib/data';
import { openBooking } from '../../lib/nav';
import { useCatalog, useSavedBookings, useStore } from '../../lib/store';
import { colors, fonts } from '../../lib/theme';

export default function Find() {
  const { findBooking } = useStore();
  const saved = useSavedBookings();
  const { svcOf } = useCatalog();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const lookup = async () => {
    const c = normalizeCode(code);
    if (!c) return setErr('Enter your booking code');
    if (busy) return;
    setBusy(true);
    try {
      if (await findBooking(c)) {
        setCode('');
        setErr('');
        openBooking(c);
      } else setErr('No booking found for ' + c + '. Check the code and try again.');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Couldn't reach Beaut. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <T w={600} style={textStyles.pageTitle}>
        Find your booking
      </T>
      <T style={{ fontSize: 15, lineHeight: 22, color: colors.muted2 }}>Enter the code you received when you booked.</T>
      <View style={{ gap: 8 }}>
        <TextInput
          value={code}
          onChangeText={(t) => {
            setCode(t.toUpperCase());
            setErr('');
          }}
          onSubmitEditing={lookup}
          placeholder="BT-XXXXX"
          placeholderTextColor={colors.placeholder}
          maxLength={9}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          style={{
            height: 68,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: err ? colors.danger : colors.border,
            backgroundColor: '#fff',
            paddingHorizontal: 20,
            fontFamily: fonts.mono600,
            fontSize: 26,
            letterSpacing: 2.6,
            color: colors.ink,
            textAlign: 'center',
          }}
        />
        {!!err && <T style={{ fontSize: 13, color: colors.danger, textAlign: 'center' }}>{err}</T>}
      </View>
      <Button label={busy ? 'Finding…' : 'Find booking'} kind={busy ? 'disabled' : 'primary'} onPress={lookup} />
      {!hasBackend && (
      <Pressable
        onPress={() => {
          setCode(DEMO_CODE);
          setErr('');
        }}
        style={{ alignItems: 'center', paddingVertical: 2 }}
      >
        <T style={{ fontSize: 13, color: colors.muted }}>
          Try the demo code{' '}
          <T mono w={600} style={{ color: colors.pink, fontSize: 13 }}>
            {DEMO_CODE}
          </T>
        </T>
      </Pressable>
      )}
      {saved.length > 0 && (
        <View style={{ gap: 10, marginTop: 6 }}>
          <T w={600} style={{ fontSize: 16 }}>
            Used on this device
          </T>
          {saved.slice(0, 3).map((b) => (
            <Card key={b.code} onPress={() => openBooking(b.code)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18 }}>
              <T mono w={600} style={{ fontSize: 14, color: colors.pink }}>
                {b.code}
              </T>
              <T style={{ flex: 1, fontSize: 13, color: colors.muted, textAlign: 'right' }}>{svcOf(b.serviceId).name}</T>
            </Card>
          ))}
        </View>
      )}
    </Page>
  );
}
