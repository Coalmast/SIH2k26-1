/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Binance Design System Tokens
        binance: {
          primary: '#fcd535',
          'primary-active': '#f0b90b',
          'primary-disabled': '#3a3a1f',
          ink: '#181a20',
          body: '#eaecef',
          'body-on-light': '#181a20',
          muted: '#707a8a',
          'muted-strong': '#929aa5',
          'hairline-on-light': '#eaecef',
          'hairline-on-dark': '#2b3139',
          'border-strong': '#cdd1d6',
          'canvas-light': '#ffffff',
          'canvas-dark': '#0b0e11',
          'surface-card-dark': '#1e2329',
          'surface-elevated-dark': '#2b3139',
          'surface-soft-light': '#fafafa',
          'surface-strong-light': '#f5f5f5',
          'on-primary': '#181a20',
          'on-dark': '#ffffff',
          'trading-up': '#0ecb81',
          'trading-down': '#f6465d',
          info: '#3b82f6',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};