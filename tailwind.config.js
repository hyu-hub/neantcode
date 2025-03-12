/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          green: '#00ff00',
          amber: '#ffb000',
          black: '#000000',
          darkGray: '#1a1a1a',
        },
      },
      fontFamily: {
        mono: ['VT323', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 1s infinite',
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '33%': { transform: 'translate(-5px, 2px)' },
          '66%': { transform: 'translate(5px, -2px)' },
        },
        flicker: {
          '0%': { opacity: '0.9' },
          '100%': { opacity: '1' },
        },
        scanline: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 