/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blueprint: {
          blue: '#8B4513', // Rich brown for main accents (replaces blue)
          'blue-light': '#A0522D', // Lighter brown for hover states
          'blue-dark': '#654321', // Darker brown for text
          'blue-50': '#FFF8F0', // Very light cream for backgrounds
          'blue-100': '#F5E6D3', // Light cream for subtle backgrounds
          'off-white': '#FFFEF7', // Warm off-white background
          'cream': '#FAF7F0', // Slightly warmer off-white
          'gray-soft': '#8B7355', // Warm gray for secondary text
          'gray-dark': '#3D2914' // Dark brown for primary text
        }
      },
      fontFamily: {
        'sans': ['Playfair Display', 'Georgia', 'serif'], // Elegant serif font family
        'blueprint': ['Playfair Display', 'Georgia', 'serif'], // Elegant serif for menu items
        'blueprint-bold': ['Playfair Display', 'Georgia', 'serif'], // Bold version for headings
        'blueprint-display': ['Playfair Display', 'Georgia', 'serif'] // Display font for large text
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
};