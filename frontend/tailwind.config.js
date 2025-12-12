/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        sage: {
          DEFAULT: '#E0E8E1', // Lighter, airier sage
          dark: '#B8C6B9',
        },
        clay: {
          DEFAULT: '#A89F91', // Soft bronze/earthy
          dark: '#8C857B',
        },
        cream: {
          DEFAULT: '#FDFBF7', // Parchment-like off-white
        },
        dark: {
          DEFAULT: '#2C332E', // Dark charcoal/deep green
          muted: '#4A524D',
        },
        accent: {
          gold: '#D4C5A3',
        },
        // Keeping some legacy mappings to prevent immediate breakages, mapped to new palette
        darkbrown: '#2C332E', 
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'float': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      },
      letterSpacing: {
        'tightest': '-0.02em',
      }
    },
  },
  plugins: [],
}

