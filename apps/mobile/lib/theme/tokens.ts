/** Overhaul design tokens — single source of truth for Phase 1+ UI kit. */
export const colors = {
  bg: '#F8F3EA',
  surface: '#FFFFFF',
  surfaceAlt: '#F1E9DB',
  ink: '#2B2118',
  inkMuted: '#8A7A6A',
  primary: '#C4572E',
  primaryDeep: '#9E3F1D',
  accent: '#E0A62E',
  success: '#3E7C4F',
  danger: '#B23A2E',
  line: '#E5DACA',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  input: 14,
  button: 16,
  card: 18,
  sheet: 24,
} as const;

export const typeScale = {
  display: { fontSize: 30, lineHeight: 36 },
  title: { fontSize: 22, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 13, lineHeight: 18 },
} as const;

export const fonts = {
  displayAr: 'Amiri_700Bold',
  displayEn: 'Fraunces_700Bold',
  bodyArRegular: 'IBMPlexSansArabic_400Regular',
  bodyArMedium: 'IBMPlexSansArabic_500Medium',
  bodyArBold: 'IBMPlexSansArabic_700Bold',
  bodyEnRegular: 'InterTight_400Regular',
  bodyEnMedium: 'InterTight_500Medium',
  bodyEnBold: 'InterTight_700Bold',
} as const;

export const shadow = {
  card: {
    shadowColor: '#5C3A20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: '#5C3A20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

export const lightTheme = {
  colors,
  spacing,
  radius,
  typeScale,
  fonts,
  shadow,
} as const;

export type Theme = typeof lightTheme;
