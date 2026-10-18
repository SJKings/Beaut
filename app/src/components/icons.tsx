import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../lib/theme';

type P = { size?: number; color?: string; width?: number };

export const ChevronLeft = ({ size = 18, color = colors.ink, width = 2.2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round">
    <Path d="M15 6l-6 6 6 6" />
  </Svg>
);

export const ChevronRight = ({ size = 18, color = colors.ink, width = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round">
    <Path d="M9 6l6 6-6 6" />
  </Svg>
);

export const ArrowRight = ({ size = 20, color = '#fff', width = 2.2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round">
    <Path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const Bell = ({ size = 20, color = colors.ink, width = 1.8 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round">
    <Path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z" />
    <Path d="M10 20.5a2 2 0 004 0" />
  </Svg>
);

export const Search = ({ size = 18, color = colors.ink, width = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round">
    <Circle cx={11} cy={11} r={7} />
    <Path d="M20 20l-4-4" />
  </Svg>
);

export const Sliders = ({ size = 18, color = colors.pink, fill = colors.pinkTint }: P & { fill?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <Path d="M4 7h16M4 17h16" />
    <Circle cx={9} cy={7} r={2.2} fill={fill} />
    <Circle cx={15} cy={17} r={2.2} fill={fill} />
  </Svg>
);

export const Calendar = ({ size = 18, color = colors.pink }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <Rect x={4} y={5} width={16} height={15} rx={3} />
    <Path d="M4 10h16M9 3v4M15 3v4" />
  </Svg>
);

export const Check = ({ size = 34, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

// Tab bar icons. The prototype used text glyphs (⌂ ⌕ # ≡) as stand-ins; these are
// drawn equivalents so they render the same on every device font.
export const NavHome = ({ size = 18, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z" />
  </Svg>
);
export const NavExplore = ({ size = 18, color = '#fff' }: P) => <Search size={size} color={color} width={2.4} />;
export const NavCode = ({ size = 18, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
    <Path d="M10 4L8 20M16 4l-2 16M4.5 9h15M4 15h15" />
  </Svg>
);
export const NavBookings = ({ size = 18, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
    <Path d="M5 7h14M5 12h14M5 17h14" />
  </Svg>
);
