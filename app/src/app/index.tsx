import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ArrowRight } from '../components/icons';
import { PlaceholderLabel, Stripes, T } from '../components/ui';
import { useStore } from '../lib/store';
import { colors, stripes } from '../lib/theme';

export default function Welcome() {
  const { onboarded, setOnboarded } = useStore();
  const insets = useSafeAreaInsets();
  if (onboarded) return <Redirect href="/home" />;

  const enter = (to: '/home' | '/find') => {
    setOnboarded();
    router.replace(to);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink, justifyContent: 'flex-end' }}>
      <StatusBar style="light" />
      <Stripes pair={stripes.dark} band={10} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '64%' }}>
        <PlaceholderLabel color={colors.onDarkFaint} size={11}>
          Salon portrait photo
        </PlaceholderLabel>
      </Stripes>
      <Svg style={{ position: 'absolute', top: '40%', left: 0, right: 0, height: '24%' }} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.ink} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.ink} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#fade)" />
      </Svg>

      <View style={{ paddingHorizontal: 28, paddingBottom: Math.max(44, insets.bottom + 10), gap: 18 }}>
        <T w={700} style={{ fontSize: 18, color: colors.pinkLight, letterSpacing: -0.36 }}>
          Beaut.
        </T>
        <T w={600} style={{ fontSize: 42, lineHeight: 44, color: '#fff', letterSpacing: -1.26 }}>
          Beauty care, booked in a minute.
        </T>
        <T style={{ fontSize: 15, lineHeight: 22, color: colors.onDarkMuted }}>
          No sign-up, no passwords. Pick a service, choose a time and keep your booking code.
        </T>
        <Pressable
          onPress={() => enter('/home')}
          accessibilityRole="button"
          style={({ pressed }) => ({
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingVertical: 7,
            paddingLeft: 7,
            paddingRight: 22,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.inkLine,
            backgroundColor: colors.inkSoft,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight />
          </View>
          <T w={500} style={{ fontSize: 16, color: '#fff', flex: 1 }}>
            Get started
          </T>
          <T w={600} style={{ color: colors.onDarkFaint, letterSpacing: 2 }}>
            ›››
          </T>
        </Pressable>
        <Pressable onPress={() => enter('/find')} style={{ padding: 6, alignItems: 'center' }}>
          <T w={500} style={{ fontSize: 15, color: colors.pinkLight }}>
            I have a booking code
          </T>
        </Pressable>
      </View>
    </View>
  );
}
