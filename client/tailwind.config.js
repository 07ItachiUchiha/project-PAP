/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {    extend: {
      colors: {
        // Nature-inspired color palette
        forest: {
          50: '#f6f8f4',
          100: '#e9f1e4',
          200: '#d4e3ca',
          300: '#b4cea3',
          400: '#8fb177',
          500: '#6f9654',
          600: '#577a41',
          700: '#456235',
          800: '#2D5016', // Primary deep forest green
          900: '#1f3810',
        },
        sage: {
          50: '#f7f8f5',
          100: '#eef2e8',
          200: '#dde4d2',
          300: '#c6d2b4',
          400: '#a8bb90',
          500: '#87A96B', // Secondary sage green
          600: '#708f57',
          700: '#5c7648',
          800: '#4b623c',
          900: '#3f5233',
        },
        terracotta: {
          50: '#fef6f4',
          100: '#feeae6',
          200: '#fdd9d2',
          300: '#fbbfb0',
          400: '#f79882',
          500: '#f07354',
          600: '#de5437',
          700: '#C7522A', // Accent warm terracotta
          800: '#a6431f',
          900: '#8a3b1e',
        },
        cream: {
          50: '#FEFBF6', // Background soft cream
          100: '#fef8f0',
          200: '#fef0e0',
          300: '#fde5c8',
          400: '#fcd7a4',
          500: '#fac574',
          600: '#f8b34a',
          700: '#f59e0b',
          800: '#d97706',
          900: '#b45309',
        },
        charcoal: {
          50: '#f6f7f6',
          100: '#e2e4e2',
          200: '#c5c9c5',
          300: '#a0a6a0',
          400: '#7c837c',
          500: '#636863',
          600: '#4f544f',
          700: '#424642',
          800: '#2C3E2D', // Rich charcoal text
          900: '#1a201a',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'body': ['Source Sans Pro', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'sway': 'sway 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'nature': '0 4px 20px -2px rgba(45, 80, 22, 0.1), 0 2px 8px -2px rgba(45, 80, 22, 0.06)',
        'glow': '0 0 20px rgba(135, 169, 107, 0.3)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(135, 169, 107, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      }
    },
  },
  plugins: [
    import('@tailwindcss/forms'),
    import('@tailwindcss/typography'),
    import('@tailwindcss/aspect-ratio'),
  ],
}
