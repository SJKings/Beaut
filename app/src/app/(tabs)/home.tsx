import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Bell, ChevronRight, Search, Sliders } from '../../components/icons';
import { HStrip, Page } from '../../components/page';
import { Card, PlaceholderLabel, Pill, Stripes, T } from '../../components/ui';
import { CATS, SERVICES, days, money, svcOf, whenLabel } from '../../lib/data';
import { useSavedBookings, useStore } from '../../lib/store';
import { openBooking, openService } from '../../lib/nav';
import { colors, stripes } from '../../lib/theme';

export default function Home() {
  const { setExplore } = useStore();
  const saved = useSavedBookings();
  const today = days()[0].iso;
  const upcoming = saved.find((b) => b.status !== 'Cancelled' && b.date >= today);
  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const toExplore = (e?: { cat: string; q: string }) => {
    if (e) setExplore(e);
    router.navigate('/explore');
  };

  return (
    <Page top={8} gap={22}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 6 }}>
        <View style={{ gap: 4 }}>
          <T style={{ fontSize: 14, color: colors.muted }}>{greeting}</T>
          <T w={600} style={{ fontSize: 26, lineHeight: 30, letterSpacing: -0.52 }}>
            {'Discover & book\nbeauty care'}
          </T>
        </View>
        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <Bell />
          <View style={{ position: 'absolute', top: 11, right: 12, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.pink, borderWidth: 2, borderColor: '#fff' }} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={() => toExplore()}
          style={{ flex: 1, height: 50, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18 }}
        >
          <Search />
          <T style={{ fontSize: 15, color: colors.placeholder }}>Search services</T>
        </Pressable>
        <Pressable onPress={() => toExplore()} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.pinkTint, alignItems: 'center', justifyContent: 'center' }}>
          <Sliders />
        </Pressable>
      </View>

      <View style={{ borderRadius: 26, backgroundColor: colors.pink, overflow: 'hidden', height: 168, flexDirection: 'row' }}>
        <View style={{ zIndex: 1, padding: 22, gap: 6, width: '58%' }}>
          <T w={700} style={{ fontSize: 30, lineHeight: 30, color: '#fff', letterSpacing: -0.6 }}>
            20% off
          </T>
          <T style={{ fontSize: 14, lineHeight: 19, color: colors.pinkOnPink }}>Your first visit at any Beaut studio</T>
          <Pill label="Book now" onPress={() => openService('s1')} style={{ marginTop: 'auto', alignSelf: 'flex-start' }} />
        </View>
        <Stripes pair={stripes.promo} band={8} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '44%' }}>
          <PlaceholderLabel color={colors.pinkOnPink} size={10}>
            {'Model\nportrait'}
          </PlaceholderLabel>
        </Stripes>
      </View>

      <Card onPress={() => router.navigate('/find')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
        <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
          <T mono w={600} style={{ color: colors.pinkLight, fontSize: 13 }}>
            #
          </T>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <T w={600} style={{ fontSize: 15 }}>
            Already booked?
          </T>
          <T style={{ fontSize: 13, color: colors.muted }}>Enter your code to view or change it</T>
        </View>
        <ChevronRight />
      </Card>

      {upcoming && (
        <View style={{ gap: 12 }}>
          <T w={600} style={{ fontSize: 18 }}>
            Upcoming on this device
          </T>
          <Card
            onPress={() => openBooking(upcoming.code)}
            style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 12 }}
          >
            <Stripes radius={16} style={{ width: 64, height: 64 }} />
            <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
              <T w={600} style={{ fontSize: 15 }}>
                {svcOf(upcoming.serviceId).name}
              </T>
              <T style={{ fontSize: 13, color: colors.muted }}>{whenLabel(upcoming)}</T>
              <T mono w={600} style={{ fontSize: 12, color: colors.pink }}>
                {upcoming.code}
              </T>
            </View>
            <ChevronRight />
          </Card>
        </View>
      )}

      <View style={{ gap: 12 }}>
        <T w={600} style={{ fontSize: 18 }}>
          Category
        </T>
        <HStrip>
          {CATS.slice(1).map((c) => (
            <Pill key={c} label={c} onPress={() => toExplore({ cat: c, q: '' })} bg="#fff" fg={colors.ink} border={colors.border} size={14} w={500} />
          ))}
        </HStrip>
      </View>

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <T w={600} style={{ fontSize: 18 }}>
            Popular services
          </T>
          <Pressable onPress={() => toExplore({ cat: 'All', q: '' })}>
            <T w={500} style={{ fontSize: 14, color: colors.pink }}>
              See all
            </T>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {SERVICES.slice(0, 4).map((s) => (
            <Card key={s.id} onPress={() => openService(s.id)} style={{ flexGrow: 1, flexBasis: '40%', padding: 8, gap: 10 }}>
              <Stripes band={7} radius={16} style={{ height: 118 }}>
                <PlaceholderLabel color="#A88792">{s.img}</PlaceholderLabel>
              </Stripes>
              <View style={{ paddingHorizontal: 6, paddingBottom: 6, gap: 4 }}>
                <T w={600} style={{ fontSize: 14, lineHeight: 17.5 }}>
                  {s.name}
                </T>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <T w={700} style={{ fontSize: 16 }}>
                      {money(s.price)}
                    </T>
                    <T style={{ fontSize: 12, color: colors.muted }}>{s.dur} min</T>
                  </View>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' }}>
                    <T style={{ color: '#fff', fontSize: 20, lineHeight: 22 }}>+</T>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </Page>
  );
}
