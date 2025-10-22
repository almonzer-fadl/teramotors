/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF5E6',
          100: '#FFEBCF',
          200: '#FFD6A6',
          300: '#FFC27D',
          400: '#FFAD53',
          500: '#F97402',
          600: '#E06902',
          700: '#B85601',
          800: '#8F4301',
          900: '#703401',
        },
      },
      fontFamily: {
        arabic: ['Asal Arabic ITF', 'sans-serif'],
        english: ['Franklin Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
