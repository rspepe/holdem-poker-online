/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'poker-green': {
          DEFAULT: '#0B5B2E',
          light: '#0E7B3D',
          dark: '#083D1F',
        },
      },
    },
  },
  plugins: [],
}
