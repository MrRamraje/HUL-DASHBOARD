/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          900: '#0a1628',
          800: '#0d2044',
          700: '#0f3060',
          600: '#1a4a8a',
          500: '#1e5fad',
          400: '#2d7dd2',
          300: '#5ba3e8',
          200: '#a8ceef',
          100: '#dbeeff',
          50: '#f0f7ff',
        },
        green: '#0ea66c',
        orange: '#e07a1a',
        red: '#d63031',
        gray: {
          900: '#1a1d23',
          700: '#3a3d45',
          500: '#6b7280',
          300: '#d1d5db',
          100: '#f3f5f8',
        },
        white: '#ffffff',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 16px rgba(10,22,40,0.10)',
        lg: '0 8px 32px rgba(10,22,40,0.14)',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
}