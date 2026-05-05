import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0d0e12',
          elevated: '#20212c',
        },
        surface: {
          DEFAULT: '#13141a',
          '2': '#1a1b23',
        },
        accent: {
          DEFAULT: '#3b82f6',
        },
        green: {
          DEFAULT: '#4ade80',
        },
        red: {
          DEFAULT: '#f87171',
        },
        yellow: {
          DEFAULT: '#fbbf24',
        },
        fg: {
          '1': '#f0f1f5',
          '2': '#b4bfcc',
          '3': '#8896a8',
          disabled: '#535e6b',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.10)',
          '2': 'rgba(255,255,255,0.06)',
          subtle: 'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.22)',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        ui: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        't-h1': ['18px', { fontWeight: '700', lineHeight: '1.3' }],
        't-h2': ['15px', { fontWeight: '700', lineHeight: '1.3' }],
        't-h3': ['13px', { fontWeight: '700', lineHeight: '1.3' }],
        't-body': ['13px', { fontWeight: '400', lineHeight: '1.5' }],
        't-body-sm': ['12px', { fontWeight: '400', lineHeight: '1.5' }],
        't-caption': ['11px', { fontWeight: '400', lineHeight: '1.4' }],
        't-micro': ['10px', { fontWeight: '400', lineHeight: '1.3' }],
        't-label': ['10px', { fontWeight: '700', lineHeight: '1.3', letterSpacing: '0.08em', textTransform: 'uppercase' }],
        't-num-xl': ['22px', { fontWeight: '700', tabularNums: true }],
        't-num-lg': ['16px', { fontWeight: '700', tabularNums: true }],
        't-num': ['12px', { fontWeight: '600', tabularNums: true }],
        't-num-sm': ['10px', { fontWeight: '600', tabularNums: true }],
      },
      borderRadius: {
        sm: '2px',
        base: '4px',
        md: '6px',
        lg: '8px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        modal: '0 32px 80px rgba(0,0,0,0.60)',
      },
      spacing: {
        '14': '3.5rem',
      },
      gap: {
        '14': '3.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
