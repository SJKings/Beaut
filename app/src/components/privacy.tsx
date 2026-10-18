import { Linking, Pressable } from 'react-native';
import { API_URL } from '../lib/api';
import { useCatalog } from '../lib/store';
import { colors } from '../lib/theme';
import { T } from './ui';

// The policy is published on the Beaut website; the address comes from the live
// catalogue so it can move without an app update. Google Play requires it to be
// reachable inside the app: it's linked from the welcome, home and bookings
// screens and the booking form.
const FALLBACK = 'https://beaut-lovat.vercel.app/privacy';

export function usePrivacy() {
  const { privacyUrl } = useCatalog();
  const url = !privacyUrl ? FALLBACK : /^https?:/.test(privacyUrl) ? privacyUrl : (API_URL || 'https://beaut-lovat.vercel.app') + privacyUrl;
  return () => Linking.openURL(url).catch(() => {});
}

export function PrivacyLink({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const open = usePrivacy();
  return (
    <Pressable onPress={open} accessibilityRole="link" hitSlop={8} style={{ alignSelf: 'center', paddingVertical: 4 }}>
      <T w={500} style={{ fontSize: 13, color: tone === 'dark' ? colors.onDarkFaint : colors.muted3, textDecorationLine: 'underline' }}>
        Privacy policy
      </T>
    </Pressable>
  );
}
