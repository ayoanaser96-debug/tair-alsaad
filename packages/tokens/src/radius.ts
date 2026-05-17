export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
