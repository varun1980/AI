/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0e17',
        surface: '#111827',
        'surface-2': '#1a2235',
        border: '#1e2d40',
        green: {
          400: '#22c55e',
          500: '#16a34a',
        },
        red: {
          400: '#f87171',
          500: '#dc2626',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
        },
        yellow: {
          400: '#facc15',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
