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
        smriti: {
          teal: '#0F766E',
          'teal-dark': '#115E59',
          'teal-light': '#14B8A6',
          mint: '#DCEFE8',
          cream: '#F8F6EF',
          navy: '#1F2937',
          peach: '#FED7AA',
        },
        axiom: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        sage: {
          50: '#F0FDF4',
          100: '#DCEFE8',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        calm: {
          bg: '#F8F6EF',
          card: '#FFFFFF',
          border: '#E5E7EB',
          text: '#1F2937',
          muted: '#6B7280',
        },
        caregiver: {
          dark: '#0B132B',
          navy: '#1C2541',
          blue: '#3A86FF',
          accent: '#48CAE4',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'soft-lg': '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'elderly': '0 6px 0px 0px rgba(13, 148, 136, 0.3)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}
