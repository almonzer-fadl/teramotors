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
      // Safari-optimized animations
      transitionTimingFunction: {
        'safari': 'cubic-bezier(0.4, 0, 0.2, 1)', // Optimized for Safari
      },
      animation: {
        'fade-in-safari': 'fadeInSafari 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-safari': 'slideInSafari 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-safari': 'scaleSafari 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeInSafari: {
          '0%': {
            opacity: '0',
            transform: 'translateZ(0)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateZ(0)',
          },
        },
        slideInSafari: {
          '0%': {
            transform: 'translate3d(-100%, 0, 0)',
            opacity: '0',
          },
          '100%': {
            transform: 'translate3d(0, 0, 0)',
            opacity: '1',
          },
        },
        scaleSafari: {
          '0%': {
            transform: 'scale3d(0.95, 0.95, 1)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale3d(1, 1, 1)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [
    // Safari animation optimization plugin
    function({ addUtilities }) {
      const safariUtilities = {
        '.gpu-accelerate': {
          '-webkit-transform': 'translate3d(0, 0, 0)',
          'transform': 'translate3d(0, 0, 0)',
          '-webkit-backface-visibility': 'hidden',
          'backface-visibility': 'hidden',
          '-webkit-perspective': '1000px',
          'perspective': '1000px',
        },
        '.safari-smooth': {
          '-webkit-font-smoothing': 'subpixel-antialiased',
          '-webkit-transform': 'translateZ(0)',
          'transform': 'translateZ(0)',
        },
      };
      addUtilities(safariUtilities);
    },
  ],
}
