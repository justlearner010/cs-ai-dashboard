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
        brand: {
          50: '#fdf5fa',
          100: '#fbeaf6',
          200: '#f7d3ee',
          300: '#f0b3e0',
          400: '#e48bcc',
          500: '#d068b8',
          600: '#c253a4',
          700: '#a8478d',
          800: '#8a3775',
          900: '#6b2b5b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
