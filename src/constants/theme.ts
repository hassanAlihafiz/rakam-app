/**
 * Rakam design system — colors, gradients, spacing, radius, typography.
 */

export const colors = {
  background: '#06060F',
  surface: '#0F0D22',
  border: '#1E1B3A',
  primary: '#7C3AED',
  primaryAlt: '#4F46E5',
  secondary: '#06B6D4',
  accent: '#A78BFA',
  success: '#4ADE80',
  warning: '#F59E0B',
  danger: '#EF4444',
  textPrimary: '#FFFFFF',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
} as const;

/** Color pairs for expo-linear-gradient / react-native-linear-gradient */
export const gradients = {
  brand: {
    colors: ['#7C3AED', '#06B6D4'] as const,
    /** 135° — top-left → bottom-right */
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  usCard: {
    colors: ['#7C3AED', '#4F46E5'] as const,
  },
  ukCard: {
    colors: ['#4F46E5', '#06B6D4'] as const,
  },
} as const;

/** 4pt grid */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const radius = {
  small: 8,
  medium: 16,
  large: 24,
  full: 9999,
} as const;

export type FontWeight =
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | 'normal'
  | 'bold';

export type TypographyStyle = {
  size: number;
  weight: FontWeight;
};

export const typography = {
  display: { size: 40, weight: '900' },
  h1: { size: 30, weight: '800' },
  h2: { size: 23, weight: '700' },
  body: { size: 15, weight: '400' },
  caption: { size: 12, weight: '500' },
} as const satisfies Record<string, TypographyStyle>;

const theme = {
  colors,
  gradients,
  spacing,
  radius,
  typography,
} as const;

export type Theme = typeof theme;

export default theme;
