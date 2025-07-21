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
      }
    },
  },
  plugins: [],
}