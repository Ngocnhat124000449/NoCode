export const palette = {
  white:    '#FFFFFF',
  gray50:   '#F8F9FB',
  gray100:  '#EEF0F4',
  gray200:  '#DDE1E9',
  gray300:  '#BEC5D1',
  gray400:  '#9AA3B0',
  gray500:  '#6B7280',
  gray600:  '#4B5563',
  gray700:  '#374151',
  gray800:  '#1F2937',
  gray900:  '#111827',

  navy900: '#0F1120',
  navy800: '#161829',
  navy700: '#1E2136',
  navy600: '#252843',
  navy500: '#2D3154',
  navy400: '#3D4166',

  blue50:  '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',

  green50:  '#F0FDF4',
  green100: '#DCFCE7',
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',

  amber50:  '#FFFBEB',
  amber100: '#FEF3C7',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',
  amber700: '#B45309',

  red50:  '#FFF1F1',
  red100: '#FFE0E0',
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',
  red700: '#B91C1C',

  purple50:  '#FAF5FF',
  purple100: '#F3E8FF',
  purple400: '#C084FC',
  purple500: '#A855F7',
  purple600: '#9333EA',
  purple700: '#7C3AED',
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
} as const;

export const radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  full: 999,
} as const;

export const typography = {
  h1:        { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2:        { fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.3 },
  h3:        { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2 },
  h4:        { fontSize: 15, fontWeight: '600' as const },
  body:      { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  caption:   { fontSize: 11, fontWeight: '400' as const, lineHeight: 16 },
  label:     { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.3 },
  mono:      { fontSize: 14, fontFamily: 'monospace' as const },
} as const;
