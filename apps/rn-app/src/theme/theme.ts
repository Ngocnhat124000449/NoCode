import { palette } from './tokens';

export const lightTheme = {
  dark: false,
  colors: {
    bgPrimary:   palette.white,
    bgSecondary: palette.gray50,
    bgTertiary:  palette.gray100,
    bgElevated:  palette.white,

    textPrimary:   palette.gray900,
    textSecondary: palette.gray500,
    textTertiary:  palette.gray300,
    textInverse:   palette.white,

    borderLight:  palette.gray100,
    borderMedium: palette.gray200,
    borderStrong: palette.gray300,

    accent:      palette.blue600,
    accentLight: palette.blue50,
    accentText:  palette.blue700,

    riskLow:      palette.green500,
    riskLowBg:    palette.green50,
    riskLowText:  palette.green700,

    riskMedium:     palette.amber500,
    riskMediumBg:   palette.amber50,
    riskMediumText: palette.amber700,

    riskHigh:     palette.red500,
    riskHighBg:   palette.red50,
    riskHighText: palette.red700,

    riskCritical:     palette.purple500,
    riskCriticalBg:   palette.purple50,
    riskCriticalText: palette.purple700,

    success: palette.green500,
    warning: palette.amber500,
    danger:  palette.red500,
    info:    palette.blue500,

    scrim:   'rgba(0,0,0,0.40)',
    overlay: 'rgba(0,0,0,0.08)',
  },
} as const;

export const darkTheme = {
  dark: true,
  colors: {
    bgPrimary:   palette.navy800,
    bgSecondary: palette.navy700,
    bgTertiary:  palette.navy600,
    bgElevated:  palette.navy600,

    textPrimary:   '#E8EAF0',
    textSecondary: palette.gray400,
    textTertiary:  palette.navy400,
    textInverse:   palette.gray900,

    borderLight:  palette.navy500,
    borderMedium: palette.navy400,
    borderStrong: '#4A4F72',

    accent:      palette.blue400,
    accentLight: 'rgba(96,165,250,0.15)',
    accentText:  palette.blue200,

    riskLow:      palette.green400,
    riskLowBg:    'rgba(74,222,128,0.12)',
    riskLowText:  '#86EFAC',

    riskMedium:     palette.amber400,
    riskMediumBg:   'rgba(251,191,36,0.12)',
    riskMediumText: '#FDE68A',

    riskHigh:     palette.red400,
    riskHighBg:   'rgba(248,113,113,0.12)',
    riskHighText: '#FCA5A5',

    riskCritical:     palette.purple400,
    riskCriticalBg:   'rgba(192,132,252,0.12)',
    riskCriticalText: '#E9D5FF',

    success: palette.green400,
    warning: palette.amber400,
    danger:  palette.red400,
    info:    palette.blue400,

    scrim:   'rgba(0,0,0,0.60)',
    overlay: 'rgba(255,255,255,0.06)',
  },
} as const;

export type AppTheme = typeof lightTheme;
