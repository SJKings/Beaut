import { Linking, Pressable } from 'react-native';
import { API_URL } from '../lib/api';
import { colors } from '../lib/theme';
import { T } from './ui';

// The policy is published by the studio's site; Google Play requires it to be
// reachable from inside the app, so it's linked from the welcome, home and
// bookings screens as well as the booking form.
export const PRIVACY_URL = (API_URL || 'https://beaut-lovat.vercel.app') + '/privacy';
export const openPrivacy = () => Linking.openURL(PRIVACY_URL).catch(() => {});

export function PrivacyLink({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <Pressable onPress={openPrivacy} accessibilityRole="link" hitSlop={8} style={{ alignSelf: 'center', paddingVertical: 4 }}>
      <T w={500} style={{ fontSize: 13, color: tone === 'dark' ? colors.onDarkFaint : colors.muted3, textDecorationLine: 'underline' }}>
        Privacy policy
      </T>
    </Pressable>
  );
}
