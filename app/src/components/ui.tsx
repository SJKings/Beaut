import { router } from 'expo-router';
import { useId, type ReactNode } from 'react';
import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { colors, fonts, stripes } from '../lib/theme';
import { ChevronLeft } from './icons';

type Weight = 300 | 400 | 500 | 600 | 700;

/** Outfit text. RN needs one font family per weight, so weight picks the family. */
export function T({ w = 400, mono, style, ...rest }: TextProps & { w?: Weight; mono?: boolean }) {
  const fontFamily = mono ? (w >= 600 ? fonts.mono600 : fonts.mono500) : fonts[w];
  return <Text {...rest} style={[{ fontFamily, color: colors.ink }, style]} />;
}

/** Diagonal striped block standing in for a photo (CSS repeating-linear-gradient 135deg). */
export function Stripes({
  pair = stripes.light,
  band = 6,
  radius = 0,
  style,
  children,
}: {
  pair?: readonly [string, string];
  band?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const id = 'st' + useId().replace(/:/g, '');
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%">
        <Defs>
          <Pattern id={id} patternUnits="userSpaceOnUse" width={band * 2} height={band * 2} patternTransform="rotate(45)">
            <Rect x={0} y={0} width={band} height={band * 2} fill={pair[0]} />
            <Rect x={band} y={0} width={band} height={band * 2} fill={pair[1]} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}

export function PlaceholderLabel({ children, color, size = 9 }: { children: ReactNode; color: string; size?: number }) {
  return (
    <T mono w={500} style={{ fontSize: size, color, textTransform: 'uppercase', textAlign: 'center', paddingHorizontal: 8, letterSpacing: 0.6 }}>
      {children}
    </T>
  );
}

export function Card({ style, children, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const base: ViewStyle = { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 22 };
  if (!rest.onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable {...rest} style={({ pressed }) => [base, style, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

type ButtonKind = 'primary' | 'dark' | 'outline' | 'ghost' | 'danger' | 'disabled';
const BTN: Record<ButtonKind, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.pink, fg: '#fff' },
  dark: { bg: colors.ink, fg: '#fff' },
  outline: { bg: 'transparent', fg: colors.ink, border: colors.outline },
  ghost: { bg: 'transparent', fg: colors.ink },
  danger: { bg: colors.danger, fg: '#fff' },
  disabled: { bg: colors.disabledBg, fg: colors.placeholder },
};

export function Button({
  label,
  onPress,
  kind = 'primary',
  height = 56,
  fg,
  weight,
  size = 16,
  style,
}: {
  label: string;
  onPress?: () => void;
  kind?: ButtonKind;
  height?: number;
  fg?: string;
  weight?: Weight;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const k = BTN[kind];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          height,
          borderRadius: 999,
          backgroundColor: k.bg,
          borderWidth: k.border ? 1 : 0,
          borderColor: k.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <T w={weight ?? (kind === 'outline' || kind === 'ghost' ? 500 : 600)} style={{ fontSize: size, color: fg ?? k.fg }}>
        {label}
      </T>
    </Pressable>
  );
}

/** Small rounded pill button (e.g. "Book now", "Copy code"). */
export function Pill({
  label,
  onPress,
  bg = colors.ink,
  fg = '#fff',
  border,
  size = 13,
  w = 600,
  px = 18,
  py = 10,
  style,
}: {
  label: string;
  onPress?: () => void;
  bg?: string;
  fg?: string;
  border?: string;
  size?: number;
  w?: Weight;
  px?: number;
  py?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        { backgroundColor: bg, borderRadius: 999, paddingHorizontal: px, paddingVertical: py, borderWidth: border ? 1 : 0, borderColor: border },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <T w={w} style={{ fontSize: size, color: fg }}>
        {label}
      </T>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, px = 18, py = 10 }: { label: string; selected?: boolean; onPress: () => void; px?: number; py?: number }) {
  return (
    <Pill
      label={label}
      onPress={onPress}
      bg={selected ? colors.pink : colors.card}
      fg={selected ? '#fff' : colors.ink}
      border={selected ? colors.pink : colors.border}
      size={14}
      w={500}
      px={px}
      py={py}
    />
  );
}

export function CircleButton({ onPress, children, bordered = true, size = 44, style }: { onPress?: () => void; children: ReactNode; bordered?: boolean; size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#fff',
          borderWidth: bordered ? 1 : 0,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/home');
}

/** Back button + title row used on the flow screens. */
export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <CircleButton onPress={goBack}>
        <ChevronLeft />
      </CircleButton>
      <T w={600} style={{ fontSize: 20, flex: 1 }}>
        {title}
      </T>
      {right}
    </View>
  );
}

/** Pinned bottom action area with the hairline divider. */
export function Footer({ children, bg }: { children: ReactNode; bg?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: Math.max(20, insets.bottom - 4),
        borderTopWidth: 1,
        borderTopColor: colors.footerLine,
        backgroundColor: bg,
      }}
    >
      {children}
    </View>
  );
}

/** Key/value list inside a white card (review + booking detail). */
export function Rows({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <Card style={{ paddingVertical: 6, paddingHorizontal: 16 }}>
      {rows.map((r, i) => (
        <View
          key={r.k}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 16,
            paddingVertical: 12,
            borderBottomWidth: i === rows.length - 1 ? 0 : 1,
            borderBottomColor: colors.divider,
          }}
        >
          <T style={{ fontSize: 14, color: colors.muted }}>{r.k}</T>
          <T w={500} style={{ fontSize: 14, textAlign: 'right', flexShrink: 1 }}>
            {r.v}
          </T>
        </View>
      ))}
    </Card>
  );
}

export function StatusBadge({ status, bg, fg, small }: { status: string; bg: string; fg: string; small?: boolean }) {
  return (
    <View style={{ borderRadius: 999, paddingHorizontal: small ? 10 : 12, paddingVertical: small ? 5 : 6, backgroundColor: bg }}>
      <T w={600} style={{ fontSize: small ? 11 : 12, color: fg }}>
        {status}
      </T>
    </View>
  );
}

export const textStyles = {
  pageTitle: { fontSize: 28, letterSpacing: -0.56 } as TextStyle,
  section: { fontSize: 18 } as TextStyle,
};
