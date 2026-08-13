import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b3ccff',
          300: '#82abff',
          400: '#5583ff',
          500: '#2f5cf5',
          600: '#1f43d6',
          700: '#1a34ab',
          800: '#182c86',
          900: '#0f1b52',
          950: '#0a1238',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b1b9c9',
          400: '#8590a8',
          500: '#66708c',
          600: '#515a73',
          700: '#42495e',
          800: '#2f3444',
          900: '#1c1f2a',
          950: '#101219',
        },
        gold: {
          400: '#e8c877',
          500: '#d4af37',
          600: '#b3901f',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-source-serif)', 'Georgia', 'serif'],
        arabic: ['var(--font-noto-arabic)', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 18, 25, 0.04), 0 8px 24px -8px rgba(16, 18, 25, 0.10)',
        'card-hover': '0 4px 12px 0 rgba(16, 18, 25, 0.06), 0 16px 32px -12px rgba(16, 18, 25, 0.16)',
        a4: '0 2px 8px rgba(16,18,25,0.08), 0 16px 40px -16px rgba(16,18,25,0.25)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeInUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.97)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out both',
        fadeInUp: 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.6s linear infinite',
        scaleIn: 'scaleIn 0.2s ease-out both',
      },
      maxWidth: {
        a4: '210mm',
      },
      minHeight: {
        a4: '297mm',
      },
      width: {
        a4: '210mm',
      },
    },
  },
  plugins: [],
};

export default config;
