/**
 * طير السعد (Tair Al Saad) design tokens — use with Tailwind (CSS variables) and for programmatic styling.
 * Prefer semantic classes (bg-primary) in components; use `tokens` for charts and inline styles.
 */
export const tokens = {
  colors: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    primaryLight: "#dbeafe",
    success: "#16a34a",
    successLight: "#dcfce7",
    warning: "#d97706",
    warningLight: "#fef3c7",
    danger: "#dc2626",
    dangerLight: "#fee2e2",
    info: "#2563eb",
    infoLight: "#dbeafe",
    neutral: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
  },
  spacing: {
    /** Tailwind default scale 0,1,2,3,4,5,6,8,10,12,16,20,24... */
    scale: "tailwind-default",
  },
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    /** Default for cards */
    card: "12px",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)",
  },
  typography: {
    fontSans: 'ui-sans-serif, system-ui, "Inter", "Segoe UI", sans-serif',
    size: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
} as const;

export type ThemeTokens = typeof tokens;
