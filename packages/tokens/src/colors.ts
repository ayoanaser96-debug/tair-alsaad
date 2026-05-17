/** Design colors from docs/01-ARCHITECTURE.md */
export const colors = {
  bg: '#FBF8F3',
  surface: '#FFFFFF',
  ink: '#1F1B17',
  inkSoft: '#5C544A',
  primary: '#2F4A5C',
  accent: '#C7704E',
  success: '#5A7A4F',
  danger: '#A8453B',
  border: '#E8E1D5',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;
