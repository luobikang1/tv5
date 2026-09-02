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
        fox: {
          50: '#fdf3f2',
          100: '#fbe4e2',
          200: '#f8cdc8',
          300: '#f3aa9e',
          400: '#ea7868',
          500: '#e04f3a',
          600: '#cd3721',
          700: '#ac2a18',
          800: '#8e2617',
          900: '#75251a',
        }
      }
    },
  },
  plugins: [],
}
