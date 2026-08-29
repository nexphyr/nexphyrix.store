/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00439C', // PlayStation Blue
        secondary: '#E6F0FA', // Light blue/white mix
        dark: '#1F2937', 
        accent: '#0070D1', // Lighter blue
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 15px 0 rgba(0, 112, 209, 0.5)' },
          '50%': { opacity: .7, boxShadow: '0 0 25px 5px rgba(0, 112, 209, 0.7)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translate(-50%, 20px)' },
          '100%': { opacity: 1, transform: 'translate(-50%, 0)' },
        }
      }
    },
  },
  plugins: [],
}
