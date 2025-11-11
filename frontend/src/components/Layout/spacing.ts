export const SPACING_SCALE = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
} as const;

export type SpacingKey = keyof typeof SPACING_SCALE;
