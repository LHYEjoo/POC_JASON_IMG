/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00ABFE',
        secondary: '#66A3FF',
        accent: '#CC0000',
        wolf: '#D6D6D6',
        jerboa: '#EEEEEE',
        text: '#333333',
      },
      boxShadow: {
        vpro: '0 2px 6px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        vpro: '16px',
      },
      keyframes: {
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fade: 'fade 200ms ease-out',
      },
      fontFamily: {
        sans: ['"Simplistic Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

