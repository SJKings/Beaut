import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft } from '../../components/icons';
import { HStrip } from '../../components/page';
import { useToast } from '../../components/toast';
import { Button, Card, Chip, CircleButton, Footer, PlaceholderLabel, Stripes, T, goBack } from '../../components/ui';
import { REVIEWS, SLOTS, SPECS, STUDIO, addMin, days, fmtDate, money, slotTaken, svcOf } from '../../lib/data';
import { ApiError } from '../../lib/api';
import { useStore } from '../../lib/store';
import { colors, stripes } from '../../lib/theme';

type Tab = 'booking' | 'about' | 'reviews';

export default function ServiceScreen() {
  const { id, reschedule } = useLocalSearchParams<{ id: string; reschedule?: string }>();
  const store = useStore();
  const flash = useToast();
  const insets = useSafeAreaInsets();
  const sv = svcOf(id);
  const ds = days();
  const existing = reschedule ? store.bookings[reschedule] : undefined;

  const [tab, setTab] = useState<Tab>('booking');
  const [spec, setSpec] = useState(existing?.spec ?? 'Any available');
  const [date, setDate] = useState(existing && ds.some((d) => d.iso === existing.date) ? existing.date : ds[0].iso);
  const [time, setTime] = useState<string | null>(existing?.time ?? null);

  const dIdx = Math.max(0, ds.findIndex((d) => d.iso === date));
  const fav = !!store.fav[sv.id];

  const [busy, setBusy] = useState(false);
  const onContinue = async () => {
    if (!time) return flash('Choose a time first');
    if (existing) {
      if (busy) return;
      setBusy(true);
      try {
        await store.rescheduleBooking(existing.code, { date, time, spec });
        flash('Booking updated');
        goBack();
      } catch (e) {
        flash(e instanceof ApiError ? e.message : "Couldn't update. Check your connection and try again.");
      } finally {
        setBusy(false);
      }
    } else {
      store.setDraft({ serviceId: sv.id, spec, date, time });
      router.push('/details');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Stripes pair={stripes.hero} band={10} style={{ height: 300 }}>
          <PlaceholderLabel color="#A8949B" size={11}>
            {sv.img}
          </PlaceholderLabel>
          <CircleButton bordered={false} onPress={goBack} style={{ position: 'absolute', top: insets.top + 8, left: 20 }}>
            <ChevronLeft />
          </CircleButton>
          <CircleButton bordered={false} onPress={() => store.toggleFav(sv.id)} style={{ position: 'absolute', top: insets.top + 8, right: 20 }}>
            <T style={{ fontSize: 18, color: fav ? colors.pink : '#C9BDC1' }}>♥</T>
          </CircleButton>
        </Stripes>

        <View style={{ marginTop: -30, backgroundColor: colors.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingHorizontal: 20, gap: 20 }}>
          <View style={{ gap: 6 }}>
            <T w={600} style={{ fontSize: 24, letterSpacing: -0.48 }}>
              {sv.name}
            </T>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <T style={{ fontSize: 14 }}>
                ★ {sv.rating} ({sv.reviews})
              </T>
              <T w={500} style={{ fontSize: 14, color: colors.pink }}>
                {STUDIO.name}
              </T>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <View style={{ backgroundColor: colors.pinkTint, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                <T w={600} style={{ fontSize: 13, color: colors.pinkDark }}>
                  {money(sv.price)}
                </T>
              </View>
              <View style={{ backgroundColor: colors.greyChip, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                <T w={500} style={{ fontSize: 13, color: colors.greyChipFg }}>
                  {sv.dur} min
                </T>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 6, backgroundColor: colors.greyChip, borderRadius: 999, padding: 5 }}>
            {(
              [
                ['booking', 'Booking'],
                ['about', 'About'],
                ['reviews', 'Reviews'],
              ] as const
            ).map(([k, l]) => (
              <Pressable
                key={k}
                onPress={() => setTab(k)}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === k }}
                style={{ flex: 1, borderRadius: 999, paddingVertical: 11, alignItems: 'center', backgroundColor: tab === k ? colors.pink : 'transparent' }}
              >
                <T w={600} style={{ fontSize: 14, color: tab === k ? '#fff' : colors.greyChipFg }}>
                  {l}
                </T>
              </Pressable>
            ))}
          </View>

          {tab === 'booking' && (
            <View style={{ gap: 20 }}>
              <View style={{ gap: 10 }}>
                <T w={600} style={{ fontSize: 16 }}>
                  Specialist
                </T>
                <HStrip>
                  {SPECS.map((p) => (
                    <Chip key={p} label={p} selected={spec === p} onPress={() => setSpec(p)} px={16} py={9} />
                  ))}
                </HStrip>
              </View>

              <View style={{ gap: 12 }}>
                <T w={600} style={{ fontSize: 16 }}>
                  {ds[dIdx].month}
                </T>
                <HStrip>
                  {ds.map((d) => {
                    const sel = d.iso === date;
                    return (
                      <Pressable
                        key={d.iso}
                        onPress={() => {
                          setDate(d.iso);
                          setTime(null);
                        }}
                        style={{
                          width: 50,
                          height: 74,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: sel ? colors.pink : colors.border,
                          backgroundColor: sel ? colors.pink : '#fff',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <T style={{ fontSize: 12, color: sel ? '#FFE1EC' : colors.muted }}>{d.dow}</T>
                        <T w={600} style={{ fontSize: 17, color: sel ? '#fff' : colors.ink }}>
                          {d.day}
                        </T>
                      </Pressable>
                    );
                  })}
                </HStrip>
              </View>

              <View style={{ gap: 12 }}>
                <T w={600} style={{ fontSize: 16 }}>
                  Time
                </T>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {SLOTS.map((t, j) => {
                    const off = slotTaken(dIdx, j);
                    const sel = time === t;
                    return (
                      <Pressable
                        key={t}
                        disabled={off}
                        onPress={() => setTime(t)}
                        accessibilityState={{ disabled: off, selected: sel }}
                        style={{
                          flexBasis: '30%',
                          flexGrow: 1,
                          borderRadius: 999,
                          paddingVertical: 12,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: sel ? colors.pink : off ? colors.greyChip : colors.border,
                          backgroundColor: sel ? colors.pink : off ? colors.greyChip : '#fff',
                        }}
                      >
                        <T
                          w={500}
                          style={{ fontSize: 14, color: sel ? '#fff' : off ? colors.slotOffFg : colors.ink, textDecorationLine: off ? 'line-through' : 'none' }}
                        >
                          {t}
                        </T>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18 }}>
                <Calendar />
                <T w={500} style={{ flex: 1, fontSize: 14 }}>
                  {fmtDate(date)}
                </T>
                <T style={{ fontSize: 13, color: colors.muted }}>{time ? time + ' – ' + addMin(time, sv.dur) : 'Pick a time'}</T>
              </Card>
            </View>
          )}

          {tab === 'about' && (
            <View style={{ gap: 16 }}>
              <T style={{ fontSize: 15, lineHeight: 23, color: colors.body }}>{sv.about}</T>
              <View style={{ gap: 10 }}>
                <T w={600} style={{ fontSize: 16 }}>
                  Good to know
                </T>
                <T style={{ fontSize: 14, lineHeight: 21, color: colors.body }}>
                  Arrive 10 minutes early. Free rescheduling up to 12 hours before your slot, using your booking code.
                </T>
              </View>
              <Card style={{ gap: 4, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18 }}>
                <T w={600} style={{ fontSize: 14 }}>
                  {STUDIO.name}
                </T>
                <T style={{ fontSize: 13, color: colors.muted }}>{STUDIO.address}</T>
              </Card>
            </View>
          )}

          {tab === 'reviews' && (
            <View style={{ gap: 10 }}>
              {REVIEWS.map((rv) => (
                <Card key={rv.name} style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <T w={600} style={{ fontSize: 14 }}>
                      {rv.name}
                    </T>
                    <T style={{ fontSize: 14, color: colors.pink }}>{rv.stars}</T>
                  </View>
                  <T style={{ fontSize: 14, lineHeight: 21, color: colors.body }}>{rv.text}</T>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <Footer bg={colors.bg}>
        <Button
          label={busy ? 'Updating…' : existing ? 'Update booking' : 'Continue'}
          kind={time && !busy ? 'primary' : 'disabled'}
          height={58}
          onPress={onContinue}
        />
      </Footer>
    </View>
  );
}
