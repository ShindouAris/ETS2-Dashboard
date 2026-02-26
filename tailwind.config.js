/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dashboard: {
          bg: '#0a0a0a',
          card: '#1a1a1a', 
          border: '#333333',
          accent: '#00ff41',
          danger: '#ff4444',
          warning: '#ffaa00',
          info: '#4488ff'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        BebasNeue_Regular: ['BebasNeue-Regular', 'sans-serif']
      }
    },
  },
  plugins: [],
}