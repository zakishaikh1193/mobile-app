/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Your existing "soft peachy" theme
        'brand-background': '#FFF0E5',
        'brand-primary': '#F9A826',
        'brand-secondary': '#39C0C8',
        'brand-text': '#2D2D2D',
        'brand-accent': '#F27B68',
        
        // --- NEW: Colors for this specific dashboard design ---
        'theme-green': '#FFF0E5',
        'theme-blue': '#E9F1F7',
        'theme-pink': '#E84393',
      },
      fontFamily: {
        // Your existing font
        'sans': ['Nunito', 'sans-serif'],

        // --- NEW: A very bold, rounded font for headlines ---
        // To use this, import "Luckiest Guy" from Google Fonts in your index.css
        'fun': ['"Luckiest Guy"', 'cursive'], 
      },
      keyframes: {
        'fly-x': {
          '0%': { transform: 'translateX(-20%)' },
          '100%': { transform: 'translateX(120vw)' },
        },
        'bounce-x': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(60px)' },
        },
      },
      animation: {
        'fly-x': 'fly-x 8s linear infinite',
        'bounce-x': 'bounce-x 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}