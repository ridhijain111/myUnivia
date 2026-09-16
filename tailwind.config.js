/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Univia Signature Lavender Palette
        lavender: {
          50: '#FAF8FE',
          100: '#F4EEFC',
          200: '#E9DFF7',
          300: '#DDD5ED',
          400: '#BFAEE3',
          500: '#8A50F7',
          600: '#7033F5', // Core Univia brand accent
          700: '#5E22E2',
          800: '#4B15C2',
          900: '#330C8C',
          950: '#1D0557',
        },
        // Dual Light / Dark Mode Semantic Canvas Tokens
        univia: {
          // Light Mode
          lightCanvas: '#F8F6FD',
          lightSurface: '#FFFFFF',
          lightSurfaceMuted: '#F5EFFB',
          lightBorder: '#E9E1F5',
          lightText: '#241E34',
          lightTextMuted: '#685D85',

          // Dark Mode - Deep Slate & Neon Lavender
          darkCanvas: '#0F172A',
          darkSurface: '#1E293B',
          darkSurfaceElevated: '#243047',
          darkBorder: '#334155',
          darkText: '#F8FAFC',
          darkTextMuted: '#94A3B8',
          neonLavender: '#9D67FF',
          neonLavenderGlow: '#A855F7',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'lavender-sm': '0 2px 8px -1px rgba(112, 51, 245, 0.08)',
        'lavender-md': '0 8px 24px -4px rgba(112, 51, 245, 0.12)',
        'lavender-lg': '0 16px 36px -6px rgba(112, 51, 245, 0.18)',
        'lavender-glow': '0 0 24px rgba(112, 51, 245, 0.25)',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
