import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

// Illustrations for the image boxes: one large line icon per service, drawn on a
// 64×64 grid in the brand colours. They stand in for photography until the
// studio has its own, and need no licence or attribution.

type Ink = { line: string; fill: string };
type Draw = (ink: Ink) => ReactNode;

const sw = 2.6; // stroke width at 64px; scales with the icon

const Sparkle = ({ x, y, r, color }: { x: number; y: number; r: number; color: string }) => (
  <Path d={`M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`} fill={color} />
);

const scissors: Draw = ({ line, fill }) => (
  <G stroke={line} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M27 37L44 8" />
    <Path d="M37 37L20 8" />
    <Circle cx={22} cy={45} r={8} fill={fill} />
    <Circle cx={42} cy={45} r={8} fill={fill} />
    <Circle cx={32} cy={24} r={1.6} fill={line} stroke="none" />
  </G>
);

const silkPress: Draw = ({ line, fill }) => (
  <G stroke={line} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
    {/* flowing hair */}
    <Path d="M14 8C22 16 18 26 26 34" />
    <Path d="M22 8C30 16 26 26 34 34" />
    <Path d="M30 8C38 16 34 26 42 34" />
    <Path d="M38 8C46 16 42 26 50 34" />
    {/* comb */}
    <Rect x={10} y={38} width={44} height={8} rx={3} fill={fill} />
    {[14, 20, 26, 32, 38, 44, 50].map((x) => (
      <Path key={x} d={`M${x} 46V55`} />
    ))}
  </G>
);

const polish: Draw = ({ line, fill }) => (
  <G stroke={line} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Rect x={26} y={6} width={12} height={16} rx={2.5} />
    <Path d="M24 22H40V27H24Z" />
    <Rect x={16} y={27} width={32} height={30} rx={9} fill={fill} />
    <Path d="M23 35V47" />
  </G>
);

const foot: Draw = ({ line, fill }) => (
  <G stroke={line} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M24 22C17 25 15 36 18 46C20 54 27 58 33 56C40 54 41 47 39 41C37 35 41 31 42 26C43 20 33 18 24 22Z" fill={fill} />
    <Circle cx={23} cy={11} r={4.5} />
    <Circle cx={32} cy={9.5} r={3.4} />
    <Circle cx={39} cy={12} r={3} />
    <Circle cx={45} cy={16} r={2.6} />
    <Circle cx={49} cy={21.5} r={2.2} />
  </G>
);

const lipstick: Draw = ({ line, fill }) => (
  <G stroke={line} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M25 30V14C25 10 30 7 39 6V30" fill={fill} />
    <Rect x={22} y={30} width={20} height={8} rx={1.5} />
    <Rect x={20} y={38} width={24} height={20} rx={3} />
    <Path d="M26 44H38" />
  </G>
);

const face: Draw = ({ line, fill }) => (
  <G stroke={line} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M32 8C19 8 13 18 13 30C13 44 21 56 32 56C43 56 51 44 51 30C51 18 45 8 32 8Z" />
    {/* cucumber slices on the eyes */}
    <Circle cx={24} cy={30} r={5.5} fill={fill} />
    <Circle cx={40} cy={30} r={5.5} fill={fill} />
    <Circle cx={24} cy={30} r={1.4} fill={line} stroke="none" />
    <Circle cx={40} cy={30} r={1.4} fill={line} stroke="none" />
    <Path d="M26 44Q32 48 38 44" />
    <Path d="M13 24C18 20 24 14 27 9" />
  </G>
);

const lashes: Draw = ({ line, fill }) => (
  <G stroke={line} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M8 36C16 24 48 24 56 36C48 48 16 48 8 36Z" />
    <Circle cx={32} cy={36} r={8} fill={fill} />
    <Circle cx={32} cy={36} r={3} fill={line} stroke="none" />
    <Path d="M14 30L9 23" />
    <Path d="M21 26L18 18" />
    <Path d="M28 24.5L27 16" />
    <Path d="M36 24.5L37 16" />
    <Path d="M43 26L46 18" />
    <Path d="M50 30L55 23" />
  </G>
);

const brow: Draw = ({ line, fill }) => (
  <G stroke={line} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M8 22C18 10 38 8 56 18C54 21 52 22 50 21C38 15 22 15 11 25C10 24 8 23 8 22Z" fill={fill} />
    <Path d="M14 44C22 34 42 34 50 44C42 54 22 54 14 44Z" />
    <Circle cx={32} cy={44} r={5} fill={line} stroke="none" />
  </G>
);

const colour: Draw = ({ line, fill }) => (
  <G stroke={line} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Path d="M38 28L54 8" />
    <Path d="M32 33L38 26L42 30L36 37Z" fill={fill} />
    <Path d="M10 38H48C47 50 40 56 29 56C18 56 11 50 10 38Z" fill={fill} />
    <Ellipse cx={29} cy={38} rx={19} ry={4} />
    <Path d="M30 30Q33 34 30 37" />
  </G>
);

const BY_ID: Record<string, Draw> = { s1: scissors, s2: silkPress, s3: polish, s4: foot, s5: lipstick, s6: face, s7: lashes, s8: brow, s9: colour };
const BY_CAT: Record<string, Draw> = { Hair: scissors, Nails: polish, Makeup: lipstick, Facial: face, Lashes: lashes };
/** The drawing for a service; new services fall back to their category's icon. */
export const drawingFor = (id: string, cat?: string): Draw => BY_ID[id] ?? (cat && BY_CAT[cat]) ?? face;

type Tone = 'light' | 'dark';
const TONES: Record<Tone, { bg: string; blob: string; ink: Ink; sparkle: string }> = {
  light: { bg: '#FBE7EF', blob: '#F7D7E3', ink: { line: '#B23763', fill: '#F5C3D5' }, sparkle: '#E58BAD' },
  dark: { bg: '#33282C', blob: '#3F3136', ink: { line: '#F08DB2', fill: '#5A3B47' }, sparkle: '#F08DB2' },
};

/** An image box for a service: soft backdrop with the service's icon at ~60% of the box. */
export function ServiceArt({
  id,
  cat,
  radius = 16,
  tone = 'light',
  iconScale = 0.6,
  style,
  children,
}: {
  id: string;
  cat?: string;
  radius?: number;
  tone?: Tone;
  iconScale?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const t = TONES[tone];
  const draw = drawingFor(id, cat);
  return (
    <View
      style={[{ borderRadius: radius, overflow: 'hidden', backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <ArtCanvas draw={draw} tone={t} iconScale={iconScale} />
      {children}
    </View>
  );
}

function ArtCanvas({ draw, tone, iconScale }: { draw: Draw; tone: (typeof TONES)[Tone]; iconScale: number }) {
  // Drawn in a 100×100 box that stretches to fit; the icon keeps its proportions.
  const s = 100 * iconScale;
  const o = (100 - s) / 2;
  return (
    <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <Circle cx={86} cy={14} r={30} fill={tone.blob} />
      <Circle cx={8} cy={96} r={18} fill={tone.blob} />
      <Sparkle x={18} y={20} r={5} color={tone.sparkle} />
      <Sparkle x={84} y={78} r={3.5} color={tone.sparkle} />
      <G transform={`translate(${o} ${o}) scale(${s / 64})`}>{draw(tone.ink)}</G>
    </Svg>
  );
}

/** Welcome screen artwork: a cluster of the studio's services on the dark backdrop. */
export function WelcomeArt({ style }: { style?: StyleProp<ViewStyle> }) {
  const ink = { line: '#F08DB2', fill: '#4A343D' };
  const soft = { line: '#8A6A76', fill: '#3A2D32' };
  const place = (draw: Draw, x: number, y: number, size: number, k: Ink) => (
    <G transform={`translate(${x} ${y}) scale(${size / 64})`}>{draw(k)}</G>
  );
  return (
    <View style={[{ backgroundColor: '#251F21', overflow: 'hidden' }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice">
        <Circle cx={50} cy={58} r={36} fill="#2E2629" />
        <Circle cx={50} cy={58} r={26} fill="#352A2F" />
        {place(face, 30, 38, 40, ink)}
        {place(scissors, 8, 16, 20, soft)}
        {place(lipstick, 74, 18, 18, soft)}
        {place(polish, 10, 84, 18, soft)}
        {place(lashes, 72, 86, 20, soft)}
        <Sparkle x={70} y={40} r={3} color="#F08DB2" />
        <Sparkle x={28} y={78} r={2.2} color="#F08DB2" />
        <Sparkle x={52} y={18} r={1.8} color="#8A6A76" />
      </Svg>
    </View>
  );
}

/** Home promo artwork: a gift with sparkles, white on the pink banner. */
export function PromoArt({ style }: { style?: StyleProp<ViewStyle> }) {
  const line = '#FFFFFF';
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <Circle cx={56} cy={52} r={40} fill="rgba(255,255,255,0.12)" />
        <G transform="translate(26 22) scale(0.8)" stroke={line} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <Rect x={8} y={26} width={48} height={12} rx={3} fill="rgba(255,255,255,0.25)" />
          <Rect x={12} y={38} width={40} height={24} rx={3} />
          <Path d="M32 26V62" />
          <Path d="M32 26C26 14 14 14 16 22C17 26 26 26 32 26Z" />
          <Path d="M32 26C38 14 50 14 48 22C47 26 38 26 32 26Z" />
        </G>
        <Sparkle x={22} y={26} r={5} color="#FFFFFF" />
        <Sparkle x={86} y={30} r={3.5} color="#FFE9F1" />
        <Sparkle x={80} y={82} r={4} color="#FFE9F1" />
      </Svg>
    </View>
  );
}
