/** Fraunces (Latin headings), Tajawal (Arabic), Inter (Latin body). */
export const fontFamilies = {
  fraunces: "'Fraunces', ui-serif, Georgia, serif",
  inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
  tajawal: "'Tajawal', 'IBM Plex Sans Arabic', ui-sans-serif, system-ui, sans-serif",
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
} as const;

export const lineHeights = {
  tight: 1.15,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.65,
} as const;

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const typography = {
  families: fontFamilies,
  sizes: fontSizes,
  lineHeights,
  weights: fontWeights,
} as const;
