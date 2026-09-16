/**
 * Binance Design System Tokens mapped for COMET Statutory Reports
 * Referenced from docs/DESIGN-binance.md
 */

export const COMET_TOKENS = {
  colors: {
    // Canvas & Surfaces
    canvasDark: '#0B0E11',
    surfaceCardDark: '#1E2329',
    canvasLight: '#FFFFFF',
    surfaceCardLight: '#F5F5F5',
    
    // Primary CTAs
    primary: '#FCD535',
    primaryHover: '#F0B90B',
    onPrimary: '#181A20',
    
    // Borders & Lines
    hairlineOnDark: '#2B3139',
    hairlineOnLight: '#EAECEF',
    
    // Status
    tradingUp: '#0ECB81', // Success
    tradingDown: '#F6465D', // Error
    
    // Text
    textPrimaryDark: '#EAECEF',
    textMutedDark: '#707A8A',
    textPrimaryLight: '#181A20',
    textMutedLight: '#707A8A',

    // PDF specific highlighting
    highlightAmber: 'rgba(252, 213, 53, 0.2)', // 20% opacity amber for auto-populated fields
  },
  typography: {
    titleLg: 'text-2xl font-bold tracking-tight',
    bodyMd: 'text-sm font-normal',
    numberSm: 'text-xs font-mono',
    button: 'text-sm font-semibold',
  },
  spacing: {
    cardPadding: 'p-6',
    sectionGap: 'gap-6',
  },
  borderRadius: {
    card: 'rounded-xl',
    button: 'rounded-md',
  }
} as const;
