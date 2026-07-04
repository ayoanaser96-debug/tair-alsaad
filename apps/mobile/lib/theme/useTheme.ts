import { lightTheme, type Theme } from './tokens';

/** Static light theme today; structured for future dark mode. */
export function useTheme(): Theme {
  return lightTheme;
}
