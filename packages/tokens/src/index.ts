import { colors } from './colors.js';
import { radius } from './radius.js';
import { spacing } from './spacing.js';
import { typography } from './typography.js';

export { colors } from './colors.js';
export { spacing } from './spacing.js';
export { typography } from './typography.js';
export { radius } from './radius.js';

export const tokens = {
  colors,
  spacing,
  typography,
  radius,
} as const;

export type Tokens = typeof tokens;
