// NEXTME AI design tokens. 8-pt spacing grid, one source of truth for the UI.
export const colors = {
  bg: '#FFF8EE',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF1DC',
  primary: '#FF9E2C',
  primaryDeep: '#EE7A12',
  primaryEdge: '#C9640A', // 3D button bottom edge
  onPrimary: '#3B2409', // dark brown on orange: AA contrast (white on #FF9E2C fails)
  text: '#202124',
  text2: '#6B6257',
  text3: '#9A8F82',
  line: '#F0E4D2',
  success: '#58CC02',
  successDeep: '#3F9B00',
  successSoft: '#E6F8D4',
  info: '#1CB0F6',
  infoDeep: '#0B7FB8',
  infoSoft: '#DDF4FF',
  danger: '#FF4B4B',
  dangerDeep: '#C92A2A',
  dangerSoft: '#FFE3E3',
  gold: '#FFC83D',
  locked: '#E7DDCF',
  night: '#2B2540',
} as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 12, md: 18, lg: 28, pill: 999 } as const;

export const fonts = {
  display: 'Baloo2_800ExtraBold',
  displayBold: 'Baloo2_700Bold',
  body: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyBlack: 'Nunito_800ExtraBold',
} as const;

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40 },
  h1: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.bodyBlack, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  bodyBold: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19 },
  label: { fontFamily: fonts.bodyBlack, fontSize: 12, lineHeight: 16, letterSpacing: 0.8 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#7A4A12',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
} as const;

export const motion = { press: 120, enter: 320, celebrate: 1400 } as const;
