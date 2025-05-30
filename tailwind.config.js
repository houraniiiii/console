/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090909',
        foreground: '#ffffff',
        primary: {
          DEFAULT: '#6E56CF',
          50: '#F0EEFF',
          100: '#E0D6FF',
          200: '#C2AFFF',
          300: '#A385FF',
          400: '#855CFF',
          500: '#6E56CF',
          600: '#5A44B3',
          700: '#463396',
          800: '#32227A',
          900: '#1E115E',
        },
        accent: {
          green: '#7DFFAF',
          pink: '#FF7DED',
          purple: '#6E56CF',
        },
        gray: {
          850: '#1a1a1a',
          925: '#0d0d0d',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(45deg, #6E56CF, #FF7DED, #7DFFAF)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} 