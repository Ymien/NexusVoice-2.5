/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Dopamine palette colors
        dopa: {
          pink: '#FF6B9E',
          yellow: '#FFD93D',
          blue: '#4D96FF',
          mint: '#6BCB77',
          purple: '#9D65C9',
          bg: '#FFF8F0',
          card: '#FFFFFF',
          text: '#2D3436'
        }
      }
    },
  },
  plugins: [],
};
