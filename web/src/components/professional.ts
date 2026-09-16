import { COMET_TOKENS } from '@/lib/design-tokens';

export const professionalTheme = {
  colors: {
    background: '#FFFFFF', // PDF background is white
    foreground: COMET_TOKENS.colors.textPrimaryLight,
    primary: COMET_TOKENS.colors.canvasDark,
    primaryForeground: '#FFFFFF',
    border: '#E2E8F0',
    text: COMET_TOKENS.colors.textPrimaryLight,
    muted: '#F8FAFC',
    mutedForeground: COMET_TOKENS.colors.textMutedLight,
  },
  spacing: {
    page: {
      marginTop: 40,
      marginBottom: 40,
      marginLeft: 40,
      marginRight: 40,
    },
    section: {
      marginBottom: 20,
    }
  },
  typography: {
    heading: {
      fontFamily: 'Helvetica-Bold',
      fontSize: {
        h1: 24,
        h2: 20,
        h3: 16,
        h4: 14,
      },
      lineHeight: 1.2,
    },
    body: {
      fontFamily: 'Helvetica',
      fontSize: 12,
      lineHeight: 1.5,
    },
    fontFamily: 'Helvetica',
    fontSize: {
      small: 10,
      base: 12,
      large: 16,
      xlarge: 24,
    }
  },
  primitives: {
    spacing: {
      0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40,
    },
    borderRadius: {
      sm: 2,
      md: 4,
      lg: 8,
      full: 9999,
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    typography: {
      xs: 10,
      sm: 12,
      base: 14,
      lg: 16,
      xl: 18,
      "2xl": 24,
      "3xl": 30,
    },
    letterSpacing: {
      normal: 0,
      tight: -0.5,
      wide: 0.5,
    }
  }
};
