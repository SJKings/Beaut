// Design tokens lifted from the Claude Design prototype (Beaut App.dc.html).
export const colors = {
  pink: '#D64C7F',
  pinkDark: '#B23763',
  pinkLight: '#F08DB2',
  pinkTint: '#FBE7EF',
  pinkWash: '#FFF5F8',
  pinkOnPink: '#FFE9F1',
  pinkDashed: '#E3A6BD',
  pinkNote: '#7A2A49',
  ink: '#1E1A1B',
  inkSoft: '#2A2427',
  inkLine: '#3A3235',
  body: '#4A4043',
  muted: '#7A6F72',
  muted2: '#6E6265',
  muted3: '#8C7F83',
  placeholder: '#A99DA0',
  bg: '#FBF8F8',
  card: '#FFFFFF',
  border: '#EFE5E8',
  divider: '#F4EEF0',
  footerLine: '#F1E8EA',
  outline: '#E6DADE',
  greyChip: '#F3EEEF',
  greyChipFg: '#5B5053',
  disabledBg: '#EBDDE2',
  slotOffFg: '#B9AEB1',
  danger: '#C0334F',
  onDarkMuted: '#CFC3C7',
  onDarkFaint: '#8A7A80',
  sheetHandle: '#E0D4D8',
  scrim: 'rgba(20,16,17,0.45)',
};

// Placeholder stripe pairs, standing in for photography the studio will supply.
export const stripes = {
  light: ['#F1DCE3', '#F7E9EE'] as const,
  dark: ['#2C2528', '#252022'] as const,
  hero: ['#3A2D32', '#33282C'] as const,
  promo: ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.06)'] as const,
};

export const fonts = {
  300: 'Outfit_300Light',
  400: 'Outfit_400Regular',
  500: 'Outfit_500Medium',
  600: 'Outfit_600SemiBold',
  700: 'Outfit_700Bold',
  mono500: 'JetBrainsMono_500Medium',
  mono600: 'JetBrainsMono_600SemiBold',
};

// Shared with the studio dashboard so a booking shows the same badge in both.
const STATUS_BG: Record<string, string> = {
  Confirmed: '#FBE7EF',
  'Checked in': '#E6EEFB',
  Completed: '#E3F1E9',
  'No-show': '#FFF1DE',
};
const STATUS_FG: Record<string, string> = {
  Confirmed: '#B23763',
  'Checked in': '#2F5AA8',
  Completed: '#2F7A57',
  'No-show': '#9A5B12',
};
export const statusColors = (status: string) => ({
  bg: STATUS_BG[status] ?? '#F0ECED',
  fg: STATUS_FG[status] ?? '#7A6F72',
});
