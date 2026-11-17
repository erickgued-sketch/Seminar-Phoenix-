// NEXTME AI design tokens v2. One source of truth for colour, depth, type, space and motion.
// `colors` is a live object: `applyScheme()` swaps its values between the light and the dark
// palette, and every component that calls `useT()`/`useScheme()` re-renders with the new values.
export type Scheme = 'light' | 'dark';

const light = {
  bg: '#FFF8EE',
  bgBloom: '#FFE4C2',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF1DC',
  sunken: '#F7EBD9',
  primary: '#FF9E2C',
  primaryDeep: '#EE7A12',
  primaryEdge: '#C9640A',
  primarySoft: '#FFE9CF',
  onPrimary: '#3B2409', // dark brown on orange: AA contrast (white on #FF9E2C fails)
  text: '#201A14',
  text2: '#6B6257',
  text3: '#9A8F82',
  line: '#F0E4D2',
  lineStrong: '#E2D3BC',
  success: '#58CC02',
  successDeep: '#3F9B00',
  successSoft: '#E6F8D4',
  onSuccess: '#173B00',
  successEdge: '#3F9B00',
  info: '#1CB0F6',
  infoDeep: '#0B7FB8',
  infoSoft: '#DDF4FF',
  onInfo: '#04283B',
  infoEdge: '#0B7FB8',
  danger: '#FF4B4B',
  dangerDeep: '#C92A2A',
  dangerSoft: '#FFE3E3',
  dangerLine: '#F3BDBD',
  onDanger: '#FFFFFF',
  knob: '#FFFFFF',
  gloss: 'rgba(255,255,255,0.16)',
  gold: '#FFC83D',
  goldEdge: '#D9A21B',
  onGold: '#5A3D00',
  locked: '#E7DDCF',
  lockedEdge: '#D3C7B6',
  night: '#2B2540',
  onNight: '#FFFFFF',
  onNight2: '#D9D3EE',
  scrim: 'rgba(32,26,20,0.35)',
  glass: 'rgba(255,248,238,0.92)',
  shadow: '#7A4A12',
  violet: '#B57BFF',
};
type Palette = typeof light;

// A warm night, not an inversion: deep brown-black grounds, the orange and Rai still glow.
const dark: Palette = {
  bg: '#16110D',
  bgBloom: '#3A2412',
  surface: '#231B15',
  surfaceAlt: '#2E231A',
  sunken: '#1C1510',
  primary: '#FFA53A',
  primaryDeep: '#FFB65C',
  primaryEdge: '#B85C0A',
  primarySoft: '#3D2A17',
  onPrimary: '#2A1806',
  text: '#F8EFE4',
  text2: '#C4B6A5',
  text3: '#8F8273',
  line: '#3A2E23',
  lineStrong: '#4D3E30',
  success: '#6BD61A',
  successDeep: '#8AE64A',
  successSoft: '#1F3312',
  onSuccess: '#0E2600',
  successEdge: '#3F8A0E',
  info: '#3DBDFA',
  infoDeep: '#7DD3FC',
  infoSoft: '#10303F',
  onInfo: '#04283B',
  infoEdge: '#0A6E9E',
  danger: '#FF6B6B',
  dangerDeep: '#FF9B9B',
  dangerSoft: '#3D1C1C',
  dangerLine: '#5C2A2A',
  onDanger: '#FFFFFF',
  knob: '#F8EFE4',
  gloss: 'rgba(255,255,255,0.10)',
  gold: '#FFC83D',
  goldEdge: '#B8860B',
  onGold: '#3D2900',
  locked: '#3A3028',
  lockedEdge: '#2A221B',
  night: '#3A3260',
  onNight: '#FFFFFF',
  onNight2: '#D9D3EE',
  scrim: 'rgba(0,0,0,0.55)',
  glass: 'rgba(35,27,21,0.9)',
  shadow: '#000000',
  violet: '#C39BFF',
};

export const palettes: Record<Scheme, Palette> = { light, dark };
export const colors: Palette = { ...light };
let current: Scheme = 'light';
export const currentScheme = (): Scheme => current;
export function applyScheme(s: Scheme): void {
  if (s === current) return;
  current = s;
  Object.assign(colors, palettes[s]);
}

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 12, md: 18, lg: 28, xl: 36, pill: 999 } as const;

export const fonts = {
  display: 'Baloo2_800ExtraBold',
  displayBold: 'Baloo2_700Bold',
  body: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyBlack: 'Nunito_800ExtraBold',
} as const;

// One confident headline per screen; quieter secondary text; caps labels are tracked out.
export const type = {
  hero: { fontFamily: fonts.display, fontSize: 38, lineHeight: 42, letterSpacing: -0.6 },
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 35, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 27, letterSpacing: -0.2 },
  h3: { fontFamily: fonts.bodyBlack, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyBold: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.bodyBlack, fontSize: 11.5, lineHeight: 16, letterSpacing: 1.1 },
} as const;

/** Three depth levels, used by role: 0 = flat on the page, 1 = something you can act on, 2 = floating. */
export const elevation = (level: 0 | 1 | 2) =>
  level === 0
    ? {}
    : {
        shadowColor: colors.shadow,
        shadowOpacity: current === 'dark' ? 0.5 : level === 1 ? 0.07 : 0.16,
        shadowRadius: level === 1 ? 14 : 28,
        shadowOffset: { width: 0, height: level === 1 ? 5 : 12 },
        elevation: level === 1 ? 2 : 8,
      };
/** Kept for older call sites. */
export const shadow = { get card() { return elevation(1); } };

/** Motion tokens — every animation uses one of these. */
export const motion = {
  press: 110,
  quick: 180,
  enter: 320,
  slow: 520,
  celebrate: 1400,
  spring: { soft: { friction: 9, tension: 70 }, snappy: { friction: 7, tension: 140 }, bouncy: { friction: 4, tension: 160 } },
} as const;

/** Accent tint per chapter, sampled from that chapter's environment art. */
export const chapterTint = ['#FF9E2C', '#F2A541', '#3FA7D6', '#E8704A', '#C98B3C', '#5BAF6A', '#8C9B4A', '#E0762F', '#B9853F', '#5C6BC0', '#4CAF7A', '#E58A4E'] as const;

/** Style factory cached per scheme: `const S = themed(() => ({...}))`, then `const s = S()` inside render. */
export function themed<T>(factory: () => T): () => T {
  const cache: Partial<Record<Scheme, T>> = {};
  return () => (cache[current] ??= factory());
}
